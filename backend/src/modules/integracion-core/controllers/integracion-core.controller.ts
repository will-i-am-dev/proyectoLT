import { Controller, Post, Get, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { CoreBankingService } from '../services/core-banking.service';
import {
    ValidarClienteResponseDto,
    ConsultarCentralesResponseDto,
    CrearSolicitudCoreResponseDto,
    EstadoSolicitudCoreResponseDto,
} from '../dto/mulesoft.dto';

/**
 * Controlador de Integración con Core Bancario
 * 
 * Expone endpoints para orquestar la integración con el Core
 * a través de Mulesoft. Estos endpoints son de uso interno.
 */
@ApiTags('integracion-core')
@Controller('integracion-core')
export class IntegracionCoreController {
    constructor(private readonly coreBankingService: CoreBankingService) { }

    /**
     * Validar cliente en Core
     */
    @Post('solicitudes/:id/validar-cliente')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Validar cliente en Core Bancario',
        description: 'Valida la identidad del cliente consultando el Core',
    })
    @ApiParam({ name: 'id', description: 'ID de la solicitud' })
    @ApiResponse({
        status: 200,
        description: 'Cliente validado',
        type: ValidarClienteResponseDto,
    })
    async validarCliente(@Param('id') id: string) {
        return await this.coreBankingService.validarCliente(id);
    }

    /**
     * Consultar centrales de riesgo
     */
    @Post('solicitudes/:id/consultar-centrales')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Consultar centrales de riesgo',
        description: 'Consulta score crediticio en centrales de riesgo',
    })
    @ApiParam({ name: 'id', description: 'ID de la solicitud' })
    @ApiResponse({
        status: 200,
        description: 'Centrales consultadas',
        type: ConsultarCentralesResponseDto,
    })
    async consultarCentrales(@Param('id') id: string) {
        return await this.coreBankingService.consultarCentralesRiesgo(id);
    }

    /**
     * Sincronizar solicitud con Core
     */
    @Post('solicitudes/:id/sincronizar')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Sincronizar solicitud con Core Bancario',
        description: 'Envía la solicitud al sistema Core para registro',
    })
    @ApiParam({ name: 'id', description: 'ID de la solicitud' })
    @ApiResponse({
        status: 200,
        description: 'Solicitud sincronizada',
        type: CrearSolicitudCoreResponseDto,
    })
    async sincronizarConCore(@Param('id') id: string) {
        return await this.coreBankingService.sincronizarConCore(id);
    }

    /**
     * Consultar estado en Core
     */
    @Get('solicitudes/:id/estado-core')
    @ApiOperation({
        summary: 'Consultar estado de solicitud en Core',
        description: 'Obtiene el estado actual de la solicitud en el Core Bancario',
    })
    @ApiParam({ name: 'id', description: 'ID de la solicitud' })
    @ApiResponse({
        status: 200,
        description: 'Estado obtenido',
        type: EstadoSolicitudCoreResponseDto,
    })
    async consultarEstadoCore(@Param('id') id: string) {
        return await this.coreBankingService.consultarEstadoCore(id);
    }

    /**
     * Health check de integración
     */

}
