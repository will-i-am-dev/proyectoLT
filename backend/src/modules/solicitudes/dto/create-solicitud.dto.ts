import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsString,
    IsEmail,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsBoolean,
    IsDate,
    IsOptional,
    Min,
    Max,
    Matches,
    ValidateNested,
    MinLength,
    MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
    TipoDocumento,
    Genero,
    SituacionLaboral,
    TipoContrato,
    TipoTarjeta,
    Franquicia,
    Canal,
} from '../domain/enums/common.enum';

// Sub-DTOs
export class DireccionResidenciaDto {
    @ApiProperty({ example: 'Calle 123 #45-67' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(200)
    calle: string;

    @ApiProperty({ example: 'Bogotá' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    ciudad: string;

    @ApiProperty({ example: 'Cundinamarca' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    departamento: string;

    @ApiProperty({ example: '110111' })
    @IsString()
    @IsNotEmpty()
    @Matches(/^\d{6}$/, { message: 'Código postal debe ser 6 dígitos' })
    codigoPostal: string;
}

export class DatosPersonalesDto {
    @ApiProperty({ example: 'Juan Carlos' })
    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    @MaxLength(100)
    nombres: string;

    @ApiProperty({ example: 'Pérez González' })
    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    @MaxLength(100)
    apellidos: string;

    @ApiProperty({ enum: TipoDocumento, example: TipoDocumento.CC })
    @IsEnum(TipoDocumento)
    @IsNotEmpty()
    tipoDocumento: TipoDocumento;

    @ApiProperty({ example: '1234567890' })
    @IsString()
    @IsNotEmpty()
    @MinLength(5)
    @MaxLength(20)
    numeroDocumento: string;

    @ApiProperty({ example: '1990-01-15', description: 'Fecha de nacimiento (YYYY-MM-DD)' })
    @IsDate()
    @Type(() => Date)
    @IsNotEmpty()
    fechaNacimiento: Date;

    @ApiProperty({ enum: Genero, example: Genero.M })
    @IsEnum(Genero)
    @IsNotEmpty()
    genero: Genero;

    @ApiProperty({ example: 'juan.perez@email.com' })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ example: '+573001234567' })
    @IsString()
    @IsNotEmpty()
    @Matches(/^\+57[3]\d{9}$/, {
        message: 'Celular debe tener formato +57XXXXXXXXXX',
    })
    celular: string;

    @ApiProperty({ type: DireccionResidenciaDto })
    @ValidateNested()
    @Type(() => DireccionResidenciaDto)
    @IsNotEmpty()
    direccionResidencia: DireccionResidenciaDto;
}

export class DatosLaboralesDto {
    @ApiPropertyOptional({ enum: SituacionLaboral, example: SituacionLaboral.EMPLEADO })
    @IsEnum(SituacionLaboral)
    @IsOptional()
    situacionLaboral?: SituacionLaboral;

    @ApiPropertyOptional({ enum: TipoContrato, example: TipoContrato.INDEFINIDO })
    @IsEnum(TipoContrato)
    @IsOptional()
    tipoContrato?: TipoContrato;

    @ApiPropertyOptional({ example: 'Empresa ABC S.A.S.' })
    @IsString()
    @IsOptional()
    @MaxLength(200)
    nombreEmpresa?: string;

    @ApiPropertyOptional({ example: 'Ingeniero de Software' })
    @IsString()
    @IsOptional()
    @MaxLength(100)
    cargoActual?: string;

    @ApiPropertyOptional({ example: 24, description: 'Antigüedad en meses' })
    @IsNumber()
    @Min(0)
    @IsOptional()
    antiguedadMeses?: number;

    @ApiPropertyOptional({ example: 3000000, description: 'Ingreso mensual en COP' })
    @IsNumber()
    @Min(1500000, { message: 'Ingreso mensual mínimo es $1,500,000 COP' })
    @IsOptional()
    ingresoMensual?: number;

    @ApiPropertyOptional({ example: 500000, description: 'Otros ingresos en COP' })
    @IsNumber()
    @Min(0)
    @IsOptional()
    otrosIngresos?: number;
}

export class ProductoSolicitadoDto {
    @ApiPropertyOptional({ enum: TipoTarjeta, example: TipoTarjeta.ORO })
    @IsEnum(TipoTarjeta)
    @IsOptional()
    tipoTarjeta?: TipoTarjeta;

    @ApiPropertyOptional({ example: 5000000, description: 'Cupo solicitado en COP' })
    @IsNumber()
    @Min(500000, { message: 'Cupo mínimo es $500,000 COP' })
    @IsOptional()
    cupoSolicitado?: number;

    @ApiPropertyOptional({ enum: Franquicia, example: Franquicia.VISA })
    @IsEnum(Franquicia)
    @IsOptional()
    franquicia?: Franquicia;

    @ApiPropertyOptional({ example: false, description: 'Indica si desea seguros adicionales' })
    @IsBoolean()
    @IsOptional()
    segurosAdicionales?: boolean;
}

export class AuditoriaDto {
    @ApiPropertyOptional({ example: true })
    @IsBoolean()
    @IsOptional()
    aceptaTerminos?: boolean;

    @ApiPropertyOptional({ example: true })
    @IsBoolean()
    @IsOptional()
    aceptaTratamientoDatos?: boolean;

    @ApiPropertyOptional({ example: true })
    @IsBoolean()
    @IsOptional()
    autorizaConsultaCentrales?: boolean;
}

export class CreateSolicitudDto {
    @ApiProperty({ type: DatosPersonalesDto })
    @ValidateNested()
    @Type(() => DatosPersonalesDto)
    @IsNotEmpty()
    datosPersonales: DatosPersonalesDto;

    @ApiPropertyOptional({ type: DatosLaboralesDto })
    @ValidateNested()
    @Type(() => DatosLaboralesDto)
    @IsOptional()
    datosLaborales?: DatosLaboralesDto;

    @ApiPropertyOptional({ type: ProductoSolicitadoDto })
    @ValidateNested()
    @Type(() => ProductoSolicitadoDto)
    @IsOptional()
    productoSolicitado?: ProductoSolicitadoDto;

    @ApiPropertyOptional({ type: AuditoriaDto })
    @ValidateNested()
    @Type(() => AuditoriaDto)
    @IsOptional()
    auditoria?: AuditoriaDto;
}
