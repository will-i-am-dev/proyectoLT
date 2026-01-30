import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { EstadoSolicitud, NivelRiesgo } from '../domain/enums/estado-solicitud.enum';
import {
    TipoDocumento,
    Genero,
    SituacionLaboral,
    TipoContrato,
    TipoTarjeta,
    Franquicia,
    Canal,
} from '../domain/enums/common.enum';

export class DireccionResidenciaResponseDto {
    @ApiProperty()
    @Expose()
    calle: string;

    @ApiProperty()
    @Expose()
    ciudad: string;

    @ApiProperty()
    @Expose()
    departamento: string;

    @ApiProperty()
    @Expose()
    codigoPostal: string;
}

export class DatosPersonalesResponseDto {
    @ApiProperty()
    @Expose()
    nombres: string;

    @ApiProperty()
    @Expose()
    apellidos: string;

    @ApiProperty({ enum: TipoDocumento })
    @Expose()
    tipoDocumento: TipoDocumento;

    @ApiProperty()
    @Expose()
    numeroDocumento: string;

    @ApiProperty()
    @Expose()
    fechaNacimiento: Date;

    @ApiProperty({ enum: Genero })
    @Expose()
    genero: Genero;

    @ApiProperty()
    @Expose()
    email: string;

    @ApiProperty()
    @Expose()
    celular: string;

    @ApiProperty({ type: DireccionResidenciaResponseDto })
    @Expose()
    @Type(() => DireccionResidenciaResponseDto)
    direccionResidencia: DireccionResidenciaResponseDto;
}

export class DatosLaboralesResponseDto {
    @ApiProperty({ enum: SituacionLaboral })
    @Expose()
    situacionLaboral: SituacionLaboral;

    @ApiPropertyOptional({ enum: TipoContrato })
    @Expose()
    tipoContrato?: TipoContrato;

    @ApiProperty()
    @Expose()
    nombreEmpresa: string;

    @ApiPropertyOptional()
    @Expose()
    cargoActual?: string;

    @ApiProperty()
    @Expose()
    antiguedadMeses: number;

    @ApiProperty()
    @Expose()
    ingresoMensual: number;

    @ApiPropertyOptional()
    @Expose()
    otrosIngresos?: number;
}

export class ProductoSolicitadoResponseDto {
    @ApiProperty({ enum: TipoTarjeta })
    @Expose()
    tipoTarjeta: TipoTarjeta;

    @ApiProperty()
    @Expose()
    cupoSolicitado: number;

    @ApiProperty({ enum: Franquicia })
    @Expose()
    franquicia: Franquicia;

    @ApiProperty()
    @Expose()
    segurosAdicionales: boolean;
}

export class HistorialEstadoResponseDto {
    @ApiProperty()
    @Expose()
    estado: string;

    @ApiProperty()
    @Expose()
    fecha: Date;

    @ApiPropertyOptional()
    @Expose()
    usuario?: string;

    @ApiPropertyOptional()
    @Expose()
    observaciones?: string;
}

export class ValidacionesResponseDto {
    @ApiProperty()
    @Expose()
    identidadValidada: boolean;

    @ApiProperty()
    @Expose()
    centralesRiesgoConsultadas: boolean;

    @ApiPropertyOptional()
    @Expose()
    scoreCredito?: number;

    @ApiPropertyOptional({ enum: NivelRiesgo })
    @Expose()
    nivelRiesgo?: NivelRiesgo;

    @ApiPropertyOptional()
    @Expose()
    deudaActual?: number;
}

export class IntegracionCoreResponseDto {
    @ApiProperty()
    @Expose()
    enviado: boolean;

    @ApiPropertyOptional()
    @Expose()
    fechaEnvio?: Date;

    @ApiPropertyOptional()
    @Expose()
    idSolicitudCore?: string;

    @ApiPropertyOptional()
    @Expose()
    estadoCore?: string;

    @ApiProperty()
    @Expose()
    intentosEnvio: number;
}

export class MetadatosResponseDto {
    @ApiProperty()
    @Expose()
    creadoEn: Date;

    @ApiProperty()
    @Expose()
    actualizadoEn: Date;

    @ApiProperty({ enum: Canal })
    @Expose()
    canal: Canal;
}

export class SolicitudResponseDto {
    @ApiProperty()
    @Expose()
    id: string;

    @ApiProperty()
    @Expose()
    numeroSolicitud: string;

    @ApiProperty({ enum: EstadoSolicitud })
    @Expose()
    estado: EstadoSolicitud;

    @ApiProperty({ type: DatosPersonalesResponseDto })
    @Expose()
    @Type(() => DatosPersonalesResponseDto)
    datosPersonales: DatosPersonalesResponseDto;

    @ApiProperty({ type: DatosLaboralesResponseDto })
    @Expose()
    @Type(() => DatosLaboralesResponseDto)
    datosLaborales: DatosLaboralesResponseDto;

    @ApiProperty({ type: ProductoSolicitadoResponseDto })
    @Expose()
    @Type(() => ProductoSolicitadoResponseDto)
    productoSolicitado: ProductoSolicitadoResponseDto;

    @ApiProperty({ type: [HistorialEstadoResponseDto] })
    @Expose()
    @Type(() => HistorialEstadoResponseDto)
    historialEstados: HistorialEstadoResponseDto[];

    @ApiProperty({ type: ValidacionesResponseDto })
    @Expose()
    @Type(() => ValidacionesResponseDto)
    validaciones: ValidacionesResponseDto;

    @ApiProperty({ type: IntegracionCoreResponseDto })
    @Expose()
    @Type(() => IntegracionCoreResponseDto)
    integracionCore: IntegracionCoreResponseDto;

    @ApiProperty({ type: MetadatosResponseDto })
    @Expose()
    @Type(() => MetadatosResponseDto)
    metadatos: MetadatosResponseDto;
}

export class SolicitudMetadataDto {
    @ApiProperty({ example: 100 })
    @Expose()
    total: number;

    @ApiProperty({ example: 1 })
    @Expose()
    page: number;

    @ApiProperty({ example: 10 })
    @Expose()
    limit: number;

    @ApiProperty({ example: 10 })
    @Expose()
    pages: number;
}

export class SolicitudListResponseDto {
    @ApiProperty({ type: [SolicitudResponseDto] })
    @Expose()
    @Type(() => SolicitudResponseDto)
    data: SolicitudResponseDto[];

    @ApiProperty({ type: SolicitudMetadataDto })
    @Expose()
    @Type(() => SolicitudMetadataDto)
    meta: SolicitudMetadataDto;
}
