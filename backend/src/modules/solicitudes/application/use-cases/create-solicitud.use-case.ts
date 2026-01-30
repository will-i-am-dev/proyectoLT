/**
 * Create Solicitud Use Case - Application Layer
 * 
 * Orchestrates the creation of a new credit card application.
 * Validates business rules and delegates persistence to Gateway.
 */

import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { SolicitudEntity, Metadatos } from '../../domain/entities/solicitud.entity';
import { SolicitudValidationService } from '../../domain/services/solicitud-validation.service';
import { ISolicitudGateway, SOLICITUD_GATEWAY } from '../gateways/solicitud.gateway';
import { EstadoSolicitud } from '../../domain/enums/estado-solicitud.enum';
import { CreateSolicitudDto } from '../../dto/create-solicitud.dto';
import { Canal } from '../../domain/enums/common.enum';

export interface CreateSolicitudInput {
    dto: CreateSolicitudDto;
    metadata: {
        ipOrigen?: string;
        userAgent?: string;
        canal?: Canal;
    };
}

export interface CreateSolicitudOutput {
    id: string;
    numeroSolicitud: string;
    estado: EstadoSolicitud;
}

@Injectable()
export class CreateSolicitudUseCase {
    constructor(
        @Inject(SOLICITUD_GATEWAY)
        private readonly solicitudGateway: ISolicitudGateway,
    ) { }

    async execute(input: CreateSolicitudInput): Promise<CreateSolicitudOutput> {
        const { dto, metadata } = input;

        // 1. Validate business rules (Domain Service)
        // 1. Validate business rules (Domain Service)
        const validationResult = SolicitudValidationService.validateAll(
            dto.datosPersonales.fechaNacimiento,
            dto.datosLaborales?.ingresoMensual,
            dto.productoSolicitado?.tipoTarjeta,
            dto.productoSolicitado?.cupoSolicitado,
        );

        if (!validationResult.isValid) {
            throw new BadRequestException(validationResult.errors.join('. '));
        }

        // 2. Generate unique numero solicitud
        const numeroSolicitud = await this.solicitudGateway.generateNumeroSolicitud();

        // 3. Create Entity
        const now = new Date();
        const metadatos: Metadatos = {
            creadoEn: now,
            actualizadoEn: now,
            ipOrigen: metadata.ipOrigen,
            userAgent: metadata.userAgent,
            canal: metadata.canal || Canal.WEB,
        };

        const entity = new SolicitudEntity({
            numeroSolicitud,
            estado: EstadoSolicitud.DRAFT,
            datosPersonales: dto.datosPersonales,
            datosLaborales: dto.datosLaborales,
            productoSolicitado: dto.productoSolicitado,
            auditoria: dto.auditoria,
            validaciones: {
                identidadValidada: false,
                centralesRiesgoConsultadas: false,
            },
            integracionCore: {
                enviado: false,
                intentosEnvio: 0,
            },
            historialEstados: [
                {
                    estado: EstadoSolicitud.DRAFT,
                    fecha: now,
                    observaciones: 'Solicitud creada',
                },
            ],
            metadatos,
        });

        // 4. Persist via Gateway
        const savedEntity = await this.solicitudGateway.save(entity);

        // 5. Return output
        return {
            id: savedEntity.id!,
            numeroSolicitud: savedEntity.numeroSolicitud,
            estado: savedEntity.estado,
        };
    }
}
