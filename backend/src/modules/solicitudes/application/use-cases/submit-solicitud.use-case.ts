/**
 * Submit Solicitud Use Case - Application Layer
 * 
 * Handles the submission of a draft solicitud for review.
 * Now includes integration with Core Banking Service.
 */

import { Injectable, Inject, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { ISolicitudGateway, SOLICITUD_GATEWAY } from '../gateways/solicitud.gateway';
import { EstadoSolicitud } from '../../domain/enums/estado-solicitud.enum';
import { CoreBankingService } from '@modules/integracion-core/services/core-banking.service';

export interface SubmitSolicitudOutput {
    id: string;
    numeroSolicitud: string;
    estado: EstadoSolicitud;
    integracionCore?: {
        validado: boolean;
        scoreCredito?: number;
        idSolicitudCore?: string;
    };
}

@Injectable()
export class SubmitSolicitudUseCase {
    private readonly logger = new Logger(SubmitSolicitudUseCase.name);

    constructor(
        @Inject(SOLICITUD_GATEWAY)
        private readonly solicitudGateway: ISolicitudGateway,
        private readonly coreBankingService: CoreBankingService,
    ) { }

    async execute(id: string): Promise<SubmitSolicitudOutput> {
        this.logger.log(`Iniciando submit de solicitud: ${id}`);

        // 1. Find entity
        const entity = await this.solicitudGateway.findById(id);
        if (!entity) {
            throw new NotFoundException(`Solicitud con ID ${id} no encontrada`);
        }

        // 2. Validate can be submitted (Domain behavior)
        if (!entity.isDraft()) {
            throw new BadRequestException('Solo se pueden enviar solicitudes en estado draft');
        }

        if (!entity.hasAcceptedTerms()) {
            throw new BadRequestException('Debe aceptar los términos y condiciones');
        }

        // 3. Submit (Domain state transition)
        entity.submit();
        await this.solicitudGateway.update(entity);

        this.logger.log(`Solicitud ${id} cambiada a estado SUBMITTED`);

        // 4. Integración con Core Bancario (con manejo de errores - Opción B)
        try {
            await this.integrarConCoreBancario(id);

            // Recargar entity actualizada después de la integración
            const updatedEntity = await this.solicitudGateway.findById(id);

            this.logger.log(`Integración Core exitosa para solicitud ${id}`);

            return {
                id: updatedEntity!.id!,
                numeroSolicitud: updatedEntity!.numeroSolicitud,
                estado: updatedEntity!.estado,
                integracionCore: {
                    validado: updatedEntity!.validaciones.identidadValidada,
                    scoreCredito: updatedEntity!.validaciones.scoreCredito,
                    idSolicitudCore: updatedEntity!.integracionCore.idSolicitudCore,
                },
            };
        } catch (error) {
            this.logger.error(
                `Error en integración Core para solicitud ${id}: ${error.message}`,
                error.stack,
            );

            // OPCIÓN B: Revertir a DRAFT si falla la integración
            this.logger.warn(`Revirtiendo solicitud ${id} a estado DRAFT debido a fallo en integración`);

            const entity = await this.solicitudGateway.findById(id);
            if (entity) {
                entity.revertToDraft(`Error en integración con Core: ${error.message}`);
                await this.solicitudGateway.update(entity);
            }

            throw new BadRequestException(
                `No se pudo procesar la solicitud debido a un error en la validación con el Core Bancario: ${error.message}. Por favor, intente nuevamente.`
            );
        }
    }

    /**
     * Integrar con Core Bancario (con reintentos)
     */
    private async integrarConCoreBancario(solicitudId: string): Promise<void> {
        this.logger.log(`Iniciando integración Core para solicitud: ${solicitudId}`);

        // Paso 1: Validar cliente en Core (con reintentos)
        this.logger.log(`[1/3] Validando cliente en Core...`);
        const validacion = await this.ejecutarConReintentos(
            () => this.coreBankingService.validarCliente(solicitudId),
            'validación de cliente',
            3
        );
        this.logger.log(`Cliente validado: ${validacion.existe ? 'Existe' : 'No existe'}`);

        // Paso 2: Consultar centrales de riesgo (con reintentos)
        this.logger.log(`[2/3] Consultando centrales de riesgo...`);
        const centrales = await this.ejecutarConReintentos(
            () => this.coreBankingService.consultarCentralesRiesgo(solicitudId),
            'consulta de centrales',
            3
        );
        this.logger.log(
            `Score crediticio: ${centrales.scoreCredito}, Nivel riesgo: ${centrales.nivelRiesgo}, Decisión: ${centrales.decision.accion}`
        );

        // Paso 3: Sincronizar con Core Bancario (con reintentos)
        this.logger.log(`[3/3] Sincronizando con Core Bancario...`);
        const sincronizacion = await this.ejecutarConReintentos(
            () => this.coreBankingService.sincronizarConCore(solicitudId),
            'sincronización con Core',
            3
        );
        this.logger.log(`Solicitud sincronizada con Core: ${sincronizacion.idSolicitudCore}`);

        this.logger.log(`✓ Integración Core completada exitosamente para solicitud: ${solicitudId}`);
    }

    /**
     * Ejecutar operación con reintentos y backoff exponencial
     */
    private async ejecutarConReintentos<T>(
        operacion: () => Promise<T>,
        descripcion: string,
        maxReintentos: number = 3,
    ): Promise<T> {
        let ultimoError: Error | null = null;

        for (let intento = 1; intento <= maxReintentos; intento++) {
            try {
                this.logger.debug(`Intento ${intento}/${maxReintentos} para ${descripcion}`);
                return await operacion();
            } catch (error) {
                ultimoError = error;
                this.logger.warn(
                    `Intento ${intento}/${maxReintentos} falló para ${descripcion}: ${error.message}`
                );

                // Si no es el último intento, esperar antes de reintentar
                if (intento < maxReintentos) {
                    const delayMs = 1000 * intento; // Backoff exponencial: 1s, 2s, 3s
                    this.logger.debug(`Esperando ${delayMs}ms antes del próximo intento...`);
                    await this.esperar(delayMs);
                }
            }
        }

        // Si llegamos aquí, todos los reintentos fallaron
        this.logger.error(
            `Todos los reintentos fallaron para ${descripcion}. Error: ${ultimoError?.message}`
        );
        throw ultimoError || new Error(`Error desconocido en ${descripcion}`);
    }

    /**
     * Helper para esperar (async sleep)
     */
    private esperar(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
