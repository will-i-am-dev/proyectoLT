import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsString,
    IsNotEmpty,
    IsNumber,
    IsBoolean,
    IsOptional,
    IsEnum,
    Min,
    Max,
} from 'class-validator';

// DTOs para validación de cliente
export class ValidarClienteDto {
    @ApiProperty({ example: 'CC' })
    @IsString()
    @IsNotEmpty()
    tipoDocumento: string;

    @ApiProperty({ example: '1234567890' })
    @IsString()
    @IsNotEmpty()
    numeroDocumento: string;

    @ApiPropertyOptional({ example: 'juan.perez@email.com' })
    @IsString()
    @IsOptional()
    email?: string;
}

export class ValidarClienteResponseDto {
    @ApiProperty({ example: true })
    existe: boolean;

    @ApiProperty({ example: true })
    esClienteActual: boolean;

    @ApiPropertyOptional({ example: '12345' })
    idClienteCore?: string;

    @ApiPropertyOptional({ example: 'Juan Pérez' })
    nombreCompleto?: string;

    @ApiPropertyOptional({ example: 'ACTIVO' })
    estadoCliente?: string;
}

// DTOs para consulta centrales de riesgo
export class ConsultarCentralesDto {
    @ApiProperty({ example: 'CC' })
    @IsString()
    @IsNotEmpty()
    tipoDocumento: string;

    @ApiProperty({ example: '1234567890' })
    @IsString()
    @IsNotEmpty()
    numeroDocumento: string;

    @ApiProperty({ example: 'Juan' })
    @IsString()
    @IsNotEmpty()
    nombres: string;

    @ApiProperty({ example: 'Pérez' })
    @IsString()
    @IsNotEmpty()
    apellidos: string;
}

export class ConsultarCentralesResponseDto {
    @ApiProperty({ example: 720 })
    @IsNumber()
    @Min(0)
    @Max(1000)
    scoreCredito: number;

    @ApiProperty({ example: 'BAJO', enum: ['BAJO', 'MEDIO', 'ALTO'] })
    @IsEnum(['BAJO', 'MEDIO', 'ALTO'])
    nivelRiesgo: string;

    @ApiProperty({ example: 5000000 })
    @IsNumber()
    @Min(0)
    deudaActual: number;

    @ApiProperty({ example: 3000000 })
    @IsNumber()
    @Min(0)
    cupoDisponible: number;

    @ApiPropertyOptional({ example: 95 })
    @IsNumber()
    @IsOptional()
    porcentajeEndeudamiento?: number;

    @ApiProperty({ example: 2 })
    @IsNumber()
    numeroObligacionesActivas: number;

    @ApiProperty({ example: 0 })
    @IsNumber()
    morasUltimos12Meses: number;

    @ApiProperty({ example: true })
    @IsBoolean()
    consultaExitosa: boolean;
}

// DTOs para crear solicitud en Core
export class CrearSolicitudCoreDto {
    @ApiProperty({ example: 'SOL-20260126-00001' })
    @IsString()
    @IsNotEmpty()
    numeroSolicitud: string;

    @ApiProperty({ example: '12345' })
    @IsString()
    @IsOptional()
    idClienteCore?: string;

    @ApiProperty()
    @IsNotEmpty()
    datosPersonales: any;

    @ApiProperty()
    @IsNotEmpty()
    datosLaborales: any;

    @ApiProperty()
    @IsNotEmpty()
    productoSolicitado: any;

    @ApiProperty()
    @IsNotEmpty()
    validaciones: any;
}

export class CrearSolicitudCoreResponseDto {
    @ApiProperty({ example: true })
    exito: boolean;

    @ApiProperty({ example: 'SOL-CORE-2026-12345' })
    idSolicitudCore: string;

    @ApiProperty({ example: 'PENDIENTE_VALIDACION' })
    estadoCore: string;

    @ApiProperty({ example: 'Solicitud creada exitosamente en Core Bancario' })
    mensaje: string;

    @ApiPropertyOptional({ example: '2026-01-26T18:45:00Z' })
    fechaCreacion?: string;
}

// DTOs para consultar estado de solicitud
export class EstadoSolicitudCoreResponseDto {
    @ApiProperty({ example: 'SOL-CORE-2026-12345' })
    idSolicitudCore: string;

    @ApiProperty({ example: 'APROBADA', enum: ['PENDIENTE_VALIDACION', 'EN_REVISION', 'APROBADA', 'RECHAZADA'] })
    estadoCore: string;

    @ApiPropertyOptional({ example: 'Solicitud aprobada por el comité de crédito' })
    observaciones?: string;

    @ApiProperty({ example: '2026-01-26T18:45:00Z' })
    fechaActualizacion: string;

    @ApiPropertyOptional({ example: 10000000 })
    cupoAprobado?: number;

    @ApiPropertyOptional({ example: 'analyst@banco.com' })
    analistaAsignado?: string;
}
