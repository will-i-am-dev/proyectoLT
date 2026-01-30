/**
 * Update Solicitud Use Case - Application Layer
 * 
 * Handles updating a draft solicitud.
 */

import { Injectable, Inject, BadRequestException, NotFoundException } from '@nestjs/common';
import { SolicitudEntity } from '../../domain/entities/solicitud.entity';
import { SolicitudValidationService } from '../../domain/services/solicitud-validation.service';
import { ISolicitudGateway, SOLICITUD_GATEWAY } from '../gateways/solicitud.gateway';
import { UpdateSolicitudDto } from '../../dto/update-solicitud.dto';

@Injectable()
export class UpdateSolicitudUseCase {
    constructor(
        @Inject(SOLICITUD_GATEWAY)
        private readonly solicitudGateway: ISolicitudGateway,
    ) { }

    async execute(id: string, dto: UpdateSolicitudDto): Promise<SolicitudEntity> {
        // 1. Find entity
        const entity = await this.solicitudGateway.findById(id);
        if (!entity) {
            throw new NotFoundException(`Solicitud con ID ${id} no encontrada`);
        }

        // 2. Validate can be updated (Domain behavior)
        if (!entity.canBeUpdated()) {
            throw new BadRequestException('Solo se pueden actualizar solicitudes en estado draft');
        }

        // 3. Apply updates via Entity methods
        if (dto.datosPersonales) {
            entity.updateDatosPersonales(dto.datosPersonales);
        }
        if (dto.datosLaborales) {
            entity.updateDatosLaborales(dto.datosLaborales);
        }
        if (dto.productoSolicitado) {
            entity.updateProductoSolicitado(dto.productoSolicitado);
        }
        if (dto.auditoria) {
            entity.updateAuditoria(dto.auditoria);
        }

        // 4. Re-validate business rules if key data changed
        if (dto.datosLaborales || dto.productoSolicitado) {
            const validationResult = SolicitudValidationService.validateAll(
                entity.datosPersonales.fechaNacimiento,
                entity.datosLaborales?.ingresoMensual,
                entity.productoSolicitado?.tipoTarjeta,
                entity.productoSolicitado?.cupoSolicitado,
            );

            if (!validationResult.isValid) {
                throw new BadRequestException(validationResult.errors.join('. '));
            }
        }

        // 5. Persist changes
        return await this.solicitudGateway.update(entity);
    }
}
