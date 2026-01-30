import { Injectable, Logger, InternalServerErrorException, Inject } from '@nestjs/common';
import { MulesoftClientService } from './mulesoft-client.service';
import { ISolicitudGateway, SOLICITUD_GATEWAY } from '@modules/solicitudes/application/gateways/solicitud.gateway';
import { EstadoSolicitud, NivelRiesgo } from '@modules/solicitudes/domain/enums/estado-solicitud.enum';

/**
 * Core Banking Service
 * 
 * Servicio de aplicación que orquesta la integración con el Core Bancario
 * a través de Mulesoft. Implementa la lógica de negocio para validaciones,
 * consultas y sincronización de solicitudes.
 * 
 * Refactored to use Gateway pattern (Clean Architecture)
 */
@Injectable()
export class CoreBankingService {
    private readonly logger = new Logger(CoreBankingService.name);

    constructor(
        private readonly mulesoftClient: MulesoftClientService,
        @Inject(SOLICITUD_GATEWAY)
        private readonly solicitudGateway: ISolicitudGateway,
    ) { }

    /**
     * Validar cliente en Core Bancario
     */
    async validarCliente(solicitudId: string) {
        this.logger.log(`Validando cliente para solicitud: ${solicitudId}`);

        const solicitudEntity = await this.solicitudGateway.findById(solicitudId);
        if (!solicitudEntity) {
            throw new Error('Solicitud no encontrada');
        }

        try {
            const resultado = await this.mulesoftClient.validarCliente({
                tipoDocumento: solicitudEntity.datosPersonales.tipoDocumento,
                numeroDocumento: solicitudEntity.datosPersonales.numeroDocumento,
                email: solicitudEntity.datosPersonales.email,
            });

            // Update entity using domain methods
            solicitudEntity.markIdentityValidated(
                resultado.existe,
                resultado.esClienteActual ? resultado.idClienteCore : undefined
            );

            // Persist changes via gateway
            await this.solicitudGateway.update(solicitudEntity);

            this.logger.log(
                `Cliente validado: ${resultado.existe ? 'Existe' : 'No existe'} - Solicitud: ${solicitudId}`,
            );

            return resultado;
        } catch (error) {
            this.logger.error(
                `Error en validación de cliente: ${error.message}`,
                error.stack,
            );

            // Record error in entity
            solicitudEntity.recordCoreError('VALIDACION_CLIENTE_ERROR', error.message);
            await this.solicitudGateway.update(solicitudEntity);

            throw new InternalServerErrorException(
                'Error al validar cliente en Core Bancario',
            );
        }
    }

    /**
     * Consultar centrales de riesgo
     */
    async consultarCentralesRiesgo(solicitudId: string) {
        this.logger.log(`Consultando centrales de riesgo para: ${solicitudId}`);

        const solicitudEntity = await this.solicitudGateway.findById(solicitudId);
        if (!solicitudEntity) {
            throw new Error('Solicitud no encontrada');
        }

        try {
            const resultado = await this.mulesoftClient.consultarCentrales({
                tipoDocumento: solicitudEntity.datosPersonales.tipoDocumento,
                numeroDocumento: solicitudEntity.datosPersonales.numeroDocumento,
                nombres: solicitudEntity.datosPersonales.nombres,
                apellidos: solicitudEntity.datosPersonales.apellidos,
            });

            // Update credit score using domain method
            solicitudEntity.updateCreditScore(
                resultado.scoreCredito,
                resultado.nivelRiesgo as NivelRiesgo,
                resultado.deudaActual,
            );

            // Apply automatic decision rules
            const decision = this.aplicarReglasDecision(
                resultado.scoreCredito,
                resultado.deudaActual,
                solicitudEntity.datosLaborales.ingresoMensual,
                solicitudEntity.productoSolicitado.cupoSolicitado,
            );

            // Update state based on decision using domain methods
            if (decision.accion === 'RECHAZAR') {
                solicitudEntity.reject(decision.razon);
            } else if (decision.accion === 'APROBAR') {
                solicitudEntity.approve(decision.razon);
            } else {
                solicitudEntity.sendToReview(decision.razon);
            }

            // Persist changes via gateway
            await this.solicitudGateway.update(solicitudEntity);

            this.logger.log(
                `Centrales consultadas - Score: ${resultado.scoreCredito}, Decisión: ${decision.accion}`,
            );

            return {
                ...resultado,
                decision,
            };
        } catch (error) {
            this.logger.error(
                `Error consultando centrales: ${error.message}`,
                error.stack,
            );

            solicitudEntity.recordCoreError('CONSULTA_CENTRALES_ERROR', error.message);
            await this.solicitudGateway.update(solicitudEntity);

            throw new InternalServerErrorException(
                'Error al consultar centrales de riesgo',
            );
        }
    }

    /**
     * Crear solicitud en Core Bancario
     */
    async sincronizarConCore(solicitudId: string) {
        this.logger.log(`Sincronizando solicitud con Core: ${solicitudId}`);

        const solicitudEntity = await this.solicitudGateway.findById(solicitudId);
        if (!solicitudEntity) {
            throw new Error('Solicitud no encontrada');
        }

        // Validate that the solicitud is in submitted state or later
        if (solicitudEntity.estado === EstadoSolicitud.DRAFT) {
            throw new Error(
                'No se puede sincronizar una solicitud en estado draft',
            );
        }

        try {
            const resultado = await this.mulesoftClient.crearSolicitud({
                numeroSolicitud: solicitudEntity.numeroSolicitud,
                idClienteCore: solicitudEntity.integracionCore.idSolicitudCore,
                datosPersonales: solicitudEntity.datosPersonales,
                datosLaborales: solicitudEntity.datosLaborales,
                productoSolicitado: solicitudEntity.productoSolicitado,
                validaciones: solicitudEntity.validaciones,
            });

            // Update integration info using domain method
            solicitudEntity.markSentToCore(resultado.idSolicitudCore, resultado.estadoCore);

            // Persist changes via gateway
            await this.solicitudGateway.update(solicitudEntity);

            this.logger.log(
                `Solicitud sincronizada con Core: ${resultado.idSolicitudCore}`,
            );

            return resultado;
        } catch (error) {
            this.logger.error(
                `Error sincronizando con Core: ${error.message}`,
                error.stack,
            );

            solicitudEntity.recordCoreError('SINCRONIZACION_CORE_ERROR', error.message);
            await this.solicitudGateway.update(solicitudEntity);

            throw new InternalServerErrorException(
                'Error al sincronizar con Core Bancario',
            );
        }
    }

    /**
     * Consultar estado de solicitud en Core
     */
    async consultarEstadoCore(solicitudId: string) {
        this.logger.log(`Consultando estado en Core para: ${solicitudId}`);

        const solicitudEntity = await this.solicitudGateway.findById(solicitudId);
        if (!solicitudEntity) {
            throw new Error('Solicitud no encontrada');
        }

        if (!solicitudEntity.integracionCore.idSolicitudCore) {
            throw new Error('Solicitud no sincronizada con Core');
        }

        try {
            const resultado = await this.mulesoftClient.consultarEstado(
                solicitudEntity.integracionCore.idSolicitudCore,
            );

            // Update core status
            solicitudEntity.updateCoreStatus(resultado.estadoCore);

            // Map core state to solicitud state
            if (resultado.estadoCore === 'APROBADA') {
                solicitudEntity.approve(`Aprobada por Core - Cupo: $${resultado.cupoAprobado}`);
            } else if (resultado.estadoCore === 'RECHAZADA') {
                solicitudEntity.reject(resultado.observaciones || 'Rechazada por Core Bancario');
            }

            // Persist changes via gateway
            await this.solicitudGateway.update(solicitudEntity);

            this.logger.log(`Estado Core actualizado: ${resultado.estadoCore}`);

            return resultado;
        } catch (error) {
            this.logger.error(
                `Error consultando estado Core: ${error.message}`,
                error.stack,
            );
            throw new InternalServerErrorException(
                'Error al consultar estado en Core Bancario',
            );
        }
    }

    /**
     * Aplicar reglas de decisión automática basadas en score
     */
    private aplicarReglasDecision(
        score: number,
        deuda: number,
        ingreso: number,
        cupoSolicitado: number,
    ): { accion: string; razon: string } {
        const porcentajeDeuda = (deuda / ingreso) * 100;
        const ratioSolicitado = cupoSolicitado / ingreso;

        // Regla 1: Score < 500 = Rechazo automático
        if (score < 500) {
            return {
                accion: 'RECHAZAR',
                razon: 'Score crediticio insuficiente (< 500)',
            };
        }

        // Regla 2: Score 500-600 + deuda > 50% = Revisión manual
        if (score >= 500 && score < 600 && porcentajeDeuda > 50) {
            return {
                accion: 'REVISION_MANUAL',
                razon: 'Score medio con alto nivel de endeudamiento (> 50%)',
            };
        }

        // Regla 3: Score > 750 + deuda < 30% = Aprobación automática
        if (score > 750 && porcentajeDeuda < 30) {
            return {
                accion: 'APROBAR',
                razon: 'Score excelente con bajo endeudamiento (< 30%)',
            };
        }

        // Regla 4: Score > 600 + deuda < 50% = Pre-aprobación (revisión)
        if (score > 600 && porcentajeDeuda < 50) {
            return {
                accion: 'REVISION_MANUAL',
                razon: 'Pre-aprobado - Requiere revisión de documentación',
            };
        }

        // Default: Revisión manual
        return {
            accion: 'REVISION_MANUAL',
            razon: 'Requiere análisis detallado por el área de crédito',
        };
    }

    /**
     * Obtener estadísticas del Circuit Breaker
     */

}
