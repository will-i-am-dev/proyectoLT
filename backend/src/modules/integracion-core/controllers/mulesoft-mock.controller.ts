import { Controller, Post, Get, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
    ValidarClienteDto,
    ValidarClienteResponseDto,
    ConsultarCentralesDto,
    ConsultarCentralesResponseDto,
    CrearSolicitudCoreDto,
    CrearSolicitudCoreResponseDto,
    EstadoSolicitudCoreResponseDto,
} from '../dto/mulesoft.dto';

/**
 * MULESOFT MOCK API
 * 
 * Este controlador simula los endpoints de Mulesoft que se integrarían
 * con el Core Bancario. En producción, estos endpoints serían proporcionados
 * por el ESB de Mulesoft.
 */
@ApiTags('mulesoft-mock')
@Controller('mulesoft/v1')
export class MulesoftMockController {
    /**
     * Validar cliente en Core Bancario
     */
    @Post('clientes/validar')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: '[MOCK] Validar si cliente existe en Core Bancario',
        description: 'Endpoint simulado de Mulesoft para validar identidad del cliente',
    })
    @ApiResponse({ status: 200, type: ValidarClienteResponseDto })
    async validarCliente(
        @Body() dto: ValidarClienteDto,
    ): Promise<ValidarClienteResponseDto> {
        // Simular delay de red
        await this.simulateDelay(500, 1500);

        // Simular validación
        const existe = Math.random() > 0.3; // 70% de probabilidad que exista
        const esClienteActual = existe && Math.random() > 0.5;

        return {
            existe,
            esClienteActual,
            idClienteCore: existe ? `CLI-${dto.numeroDocumento}` : undefined,
            nombreCompleto: existe ? 'Juan Pérez (Simulado)' : undefined,
            estadoCliente: esClienteActual ? 'ACTIVO' : undefined,
        };
    }

    /**
     * Consultar centrales de riesgo
     */
    @Post('centrales-riesgo/consultar')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: '[MOCK] Consultar score crediticio en centrales de riesgo',
        description: 'Endpoint simulado para consultar DataCrédito y TransUnion',
    })
    @ApiResponse({ status: 200, type: ConsultarCentralesResponseDto })
    async consultarCentrales(
        @Body() dto: ConsultarCentralesDto,
    ): Promise<ConsultarCentralesResponseDto> {
        // Simular delay de red (consultas a centrales son más lentas)
        await this.simulateDelay(1000, 3000);

        // Generar score aleatorio pero realista
        const scoreCredito = Math.floor(Math.random() * 450) + 350; // 350-800
        const deudaActual = Math.floor(Math.random() * 20000000); // 0-20M
        const cupoDisponible = Math.floor(Math.random() * 10000000); // 0-10M
        const numeroObligaciones = Math.floor(Math.random() * 5);
        const moras = Math.random() > 0.8 ? Math.floor(Math.random() * 3) : 0;

        // Calcular nivel de riesgo basado en score
        let nivelRiesgo: 'BAJO' | 'MEDIO' | 'ALTO';
        if (scoreCredito >= 700) {
            nivelRiesgo = 'BAJO';
        } else if (scoreCredito >= 550) {
            nivelRiesgo = 'MEDIO';
        } else {
            nivelRiesgo = 'ALTO';
        }

        const porcentajeEndeudamiento =
            cupoDisponible > 0
                ? Math.round((deudaActual / (deudaActual + cupoDisponible)) * 100)
                : 0;

        return {
            scoreCredito,
            nivelRiesgo,
            deudaActual,
            cupoDisponible,
            porcentajeEndeudamiento,
            numeroObligacionesActivas: numeroObligaciones,
            morasUltimos12Meses: moras,
            consultaExitosa: true,
        };
    }

    /**
     * Crear solicitud en Core Bancario
     */
    @Post('solicitudes/crear')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: '[MOCK] Crear solicitud en Core Bancario',
        description: 'Endpoint simulado para registrar solicitud en el sistema Core',
    })
    @ApiResponse({ status: 201, type: CrearSolicitudCoreResponseDto })
    async crearSolicitud(
        @Body() dto: CrearSolicitudCoreDto,
    ): Promise<CrearSolicitudCoreResponseDto> {
        // Simular delay de procesamiento
        await this.simulateDelay(800, 2000);

        // Simular posible fallo (5% de probabilidad)
        if (Math.random() < 0.05) {
            throw new Error('Error de comunicación con Core Bancario (simulado)');
        }

        const idSolicitudCore = `SOL-CORE-${Date.now()}`;
        const estadoCore = 'PENDIENTE_VALIDACION';

        return {
            exito: true,
            idSolicitudCore,
            estadoCore,
            mensaje: 'Solicitud creada exitosamente en Core Bancario',
            fechaCreacion: new Date().toISOString(),
        };
    }

    /**
     * Consultar estado de solicitud en Core
     */
    @Get('solicitudes/:idSolicitudCore/estado')
    @ApiOperation({
        summary: '[MOCK] Consultar estado de solicitud en Core',
        description: 'Endpoint simulado para polling de estados',
    })
    @ApiResponse({ status: 200, type: EstadoSolicitudCoreResponseDto })
    async consultarEstado(
        @Param('idSolicitudCore') idSolicitudCore: string,
    ): Promise<EstadoSolicitudCoreResponseDto> {
        // Simular delay
        await this.simulateDelay(300, 800);

        // Simular diferentes estados con probabilidades
        const random = Math.random();
        let estadoCore: string;
        let observaciones: string;
        let cupoAprobado: number | undefined;

        if (random < 0.2) {
            estadoCore = 'PENDIENTE_VALIDACION';
            observaciones = 'En espera de validación de documentos';
        } else if (random < 0.5) {
            estadoCore = 'EN_REVISION';
            observaciones = 'Solicitud en revisión por el área de crédito';
        } else if (random < 0.8) {
            estadoCore = 'APROBADA';
            observaciones = 'Solicitud aprobada por el comité de crédito';
            cupoAprobado = Math.floor(Math.random() * 15000000) + 2000000;
        } else {
            estadoCore = 'RECHAZADA';
            observaciones = 'Solicitud rechazada por no cumplir políticas de crédito';
        }

        return {
            idSolicitudCore,
            estadoCore,
            observaciones,
            fechaActualizacion: new Date().toISOString(),
            cupoAprobado,
            analistaAsignado:
                estadoCore !== 'PENDIENTE_VALIDACION'
                    ? 'analista.credito@banco.com'
                    : undefined,
        };
    }

    /**
     * Helper para simular delays de red realistas
     */
    private async simulateDelay(min: number, max: number): Promise<void> {
        const delay = Math.floor(Math.random() * (max - min + 1)) + min;
        return new Promise((resolve) => setTimeout(resolve, delay));
    }
}
