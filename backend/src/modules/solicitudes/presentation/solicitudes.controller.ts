/**
 * Solicitudes Controller - Presentation Layer
 * 
 * HTTP layer that handles requests and delegates to Use Cases.
 * Following Clean Architecture: Controllers only deal with HTTP concerns.
 */

import {
    Controller,
    Get,
    Post,
    Patch,
    Body,
    Param,
    Query,
    HttpCode,
    HttpStatus,
    Req,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiQuery,
} from '@nestjs/swagger';
import { Request } from 'express';

// Use Cases
import {
    CreateSolicitudUseCase,
    SubmitSolicitudUseCase,
    FindSolicitudUseCase,
    ListSolicitudesUseCase,
    UpdateSolicitudUseCase,
    AbandonSolicitudUseCase,
} from '../application/use-cases';

// DTOs
import { CreateSolicitudDto } from '../dto/create-solicitud.dto';
import { UpdateSolicitudDto } from '../dto/update-solicitud.dto';
import {
    SolicitudResponseDto,
    SolicitudListResponseDto,
} from '../dto/solicitud-response.dto';

// Enums
import { Canal } from '../domain/enums/common.enum';
import { EstadoSolicitud } from '../domain/enums/estado-solicitud.enum';

@ApiTags('solicitudes')
@Controller('solicitudes')
export class SolicitudesController {
    constructor(
        private readonly createSolicitudUseCase: CreateSolicitudUseCase,
        private readonly submitSolicitudUseCase: SubmitSolicitudUseCase,
        private readonly findSolicitudUseCase: FindSolicitudUseCase,
        private readonly listSolicitudesUseCase: ListSolicitudesUseCase,
        private readonly updateSolicitudUseCase: UpdateSolicitudUseCase,
        private readonly abandonSolicitudUseCase: AbandonSolicitudUseCase,
    ) { }

    /**
     * Crear nueva solicitud en estado draft
     */
    @Post()
    @ApiOperation({
        summary: 'Crear nueva solicitud de tarjeta de crédito',
        description:
            'Crea una nueva solicitud en estado draft. Los datos pueden ser guardados parcialmente.',
    })
    @ApiResponse({
        status: 201,
        description: 'Solicitud creada exitosamente',
        type: SolicitudResponseDto,
    })
    @ApiResponse({ status: 400, description: 'Datos inválidos' })
    async create(@Body() createDto: CreateSolicitudDto, @Req() req: Request) {
        const metadata = {
            ipOrigen: req.ip || 'unknown',
            userAgent: req.headers['user-agent'] || 'unknown',
            canal: Canal.WEB,
        };

        return await this.createSolicitudUseCase.execute({
            dto: createDto,
            metadata,
        });
    }

    /**
     * Obtener solicitud por ID
     */
    @Get(':id')
    @ApiOperation({ summary: 'Obtener solicitud por ID' })
    @ApiParam({ name: 'id', description: 'ID de la solicitud (MongoDB ObjectId)' })
    @ApiResponse({
        status: 200,
        description: 'Solicitud encontrada',
        type: SolicitudResponseDto,
    })
    @ApiResponse({ status: 404, description: 'Solicitud no encontrada' })
    async findById(@Param('id') id: string) {
        const entity = await this.findSolicitudUseCase.execute(id);
        return entity.toProps();
    }

    /**
     * Listar solicitudes con filtros y paginación
     */
    @Get()
    @ApiOperation({
        summary: 'Listar solicitudes con filtros y paginación',
        description:
            'Obtiene un listado paginado de solicitudes con filtros opcionales',
    })
    @ApiQuery({ name: 'page', required: false, example: 1 })
    @ApiQuery({ name: 'limit', required: false, example: 10 })
    @ApiQuery({ name: 'estado', required: false, enum: EstadoSolicitud })
    @ApiQuery({ name: 'tipoTarjeta', required: false })
    @ApiQuery({ name: 'email', required: false })
    @ApiQuery({ name: 'numeroDocumento', required: false })
    @ApiQuery({ name: 'fechaDesde', required: false, description: 'YYYY-MM-DD' })
    @ApiQuery({ name: 'fechaHasta', required: false, description: 'YYYY-MM-DD' })
    @ApiResponse({
        status: 200,
        description: 'Listado de solicitudes',
        type: SolicitudListResponseDto,
    })
    async findAll(@Query() query: any) {
        const { page, limit, ...filters } = query;

        const pagination = {
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 10,
        };

        const result = await this.listSolicitudesUseCase.execute(filters, pagination);

        return {
            data: result.data.map((entity) => entity.toProps()),
            meta: result.meta,
        };
    }

    /**
     * Actualizar solicitud (solo draft)
     */
    @Patch(':id')
    @ApiOperation({
        summary: 'Actualizar solicitud',
        description:
            'Actualiza una solicitud existente. Solo se pueden actualizar solicitudes en estado draft.',
    })
    @ApiParam({ name: 'id', description: 'ID de la solicitud' })
    @ApiResponse({
        status: 200,
        description: 'Solicitud actualizada',
        type: SolicitudResponseDto,
    })
    @ApiResponse({
        status: 400,
        description: 'No se puede actualizar (estado no válido)',
    })
    @ApiResponse({ status: 404, description: 'Solicitud no encontrada' })
    async update(
        @Param('id') id: string,
        @Body() updateDto: UpdateSolicitudDto,
    ) {
        const entity = await this.updateSolicitudUseCase.execute(id, updateDto);
        return entity.toProps();
    }

    /**
     * Enviar solicitud para revisión (submit)
     */
    @Post(':id/submit')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Enviar solicitud para revisión',
        description:
            'Cambia el estado de la solicitud de draft a submitted. Valida que todos los datos requeridos estén completos.',
    })
    @ApiParam({ name: 'id', description: 'ID de la solicitud' })
    @ApiResponse({
        status: 200,
        description: 'Solicitud enviada exitosamente',
        type: SolicitudResponseDto,
    })
    @ApiResponse({
        status: 400,
        description: 'Datos incompletos o estado inválido',
    })
    @ApiResponse({ status: 404, description: 'Solicitud no encontrada' })
    async submit(@Param('id') id: string) {
        return await this.submitSolicitudUseCase.execute(id);
    }

    /**
     * Abandonar solicitud
     */
    @Post(':id/abandon')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Abandonar solicitud',
        description:
            'Marca la solicitud como abandonada. No se puede abandonar solicitudes aprobadas o rechazadas.',
    })
    @ApiParam({ name: 'id', description: 'ID de la solicitud' })
    @ApiResponse({
        status: 200,
        description: 'Solicitud abandonada',
        type: SolicitudResponseDto,
    })
    @ApiResponse({
        status: 400,
        description: 'No se puede abandonar (estado no válido)',
    })
    @ApiResponse({ status: 404, description: 'Solicitud no encontrada' })
    async abandon(@Param('id') id: string) {
        const entity = await this.abandonSolicitudUseCase.execute(id);
        return entity.toProps();
    }
}
