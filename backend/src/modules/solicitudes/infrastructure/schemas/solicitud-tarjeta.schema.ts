import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import {
    TipoDocumento,
    Genero,
    SituacionLaboral,
    TipoContrato,
    TipoTarjeta,
    Franquicia,
    Canal,
} from '../../domain/enums/common.enum';
import { EstadoSolicitud, NivelRiesgo } from '../../domain/enums/estado-solicitud.enum';

export type SolicitudTarjetaCreditoDocument = SolicitudTarjetaCredito & Document;

// Sub-schemas
@Schema({ _id: false })
export class DireccionResidencia {
    @Prop({ required: true })
    calle: string;

    @Prop({ required: true })
    ciudad: string;

    @Prop({ required: true })
    departamento: string;

    @Prop({ required: true })
    codigoPostal: string;
}

@Schema({ _id: false })
export class DatosPersonales {
    @Prop({ required: true })
    nombres: string;

    @Prop({ required: true })
    apellidos: string;

    @Prop({ required: true, enum: TipoDocumento })
    tipoDocumento: TipoDocumento;

    @Prop({ required: true, unique: false })
    numeroDocumento: string;

    @Prop({ required: true, type: Date })
    fechaNacimiento: Date;

    @Prop({ required: true, enum: Genero })
    genero: Genero;

    @Prop({ required: true, lowercase: true })
    email: string;

    @Prop({ required: true })
    celular: string;

    @Prop({ type: DireccionResidencia, required: true })
    direccionResidencia: DireccionResidencia;
}

@Schema({ _id: false })
export class DatosLaborales {
    @Prop({ required: false, enum: SituacionLaboral })
    situacionLaboral: SituacionLaboral;

    @Prop({ required: false, enum: TipoContrato })
    tipoContrato?: TipoContrato;

    @Prop({ required: false })
    nombreEmpresa?: string;

    @Prop({ required: false })
    cargoActual?: string;

    @Prop({ required: false, min: 0 })
    antiguedadMeses?: number;

    @Prop({ required: false, min: 0 })
    ingresoMensual?: number;

    @Prop({ required: false, min: 0 })
    otrosIngresos?: number;
}

@Schema({ _id: false })
export class ProductoSolicitado {
    @Prop({ required: false, enum: TipoTarjeta })
    tipoTarjeta?: TipoTarjeta;

    @Prop({ required: false, min: 500000 })
    cupoSolicitado?: number;

    @Prop({ required: false, enum: Franquicia })
    franquicia?: Franquicia;

    @Prop({ default: false })
    segurosAdicionales?: boolean;
}

@Schema({ _id: false })
export class HistorialEstado {
    @Prop({ required: true })
    estado: string;

    @Prop({ required: true, type: Date, default: Date.now })
    fecha: Date;

    @Prop({ required: false })
    usuario?: string;

    @Prop({ required: false })
    observaciones?: string;
}

@Schema({ _id: false })
export class Validaciones {
    @Prop({ default: false })
    identidadValidada: boolean;

    @Prop({ default: false })
    centralesRiesgoConsultadas: boolean;

    @Prop({ required: false, min: 0, max: 1000 })
    scoreCredito?: number;

    @Prop({ required: false, enum: NivelRiesgo })
    nivelRiesgo?: NivelRiesgo;

    @Prop({ required: false, min: 0 })
    deudaActual?: number;
}

@Schema({ _id: false })
export class UltimoError {
    @Prop({ required: true })
    codigo: string;

    @Prop({ required: true })
    mensaje: string;

    @Prop({ required: true, type: Date })
    fecha: Date;
}

@Schema({ _id: false })
export class IntegracionCore {
    @Prop({ default: false })
    enviado: boolean;

    @Prop({ required: false, type: Date })
    fechaEnvio?: Date;

    @Prop({ required: false })
    idSolicitudCore?: string;

    @Prop({ required: false })
    estadoCore?: string;

    @Prop({ default: 0, min: 0 })
    intentosEnvio: number;

    @Prop({ required: false, type: UltimoError })
    ultimoError?: UltimoError;
}

@Schema({ _id: false })
export class Metadatos {
    @Prop({ required: true, type: Date, default: Date.now })
    creadoEn: Date;

    @Prop({ required: true, type: Date, default: Date.now })
    actualizadoEn: Date;

    @Prop({ required: true })
    ipOrigen: string;

    @Prop({ required: true })
    userAgent: string;

    @Prop({ required: true, enum: Canal, default: Canal.WEB })
    canal: Canal;
}

@Schema({ _id: false })
export class Auditoria {
    @Prop({ required: false, default: false })
    aceptaTerminos?: boolean;

    @Prop({ required: false, type: Date })
    fechaAceptacionTerminos?: Date;

    @Prop({ required: false, default: false })
    aceptaTratamientoDatos?: boolean;

    @Prop({ required: false, default: false })
    autorizaConsultaCentrales?: boolean;
}

// Main schema
@Schema({ collection: 'solicitudes_tarjeta_credito', timestamps: true })
export class SolicitudTarjetaCredito {
    @Prop({ required: true, unique: true, index: true })
    numeroSolicitud: string;

    @Prop({
        required: true,
        enum: EstadoSolicitud,
        default: EstadoSolicitud.DRAFT,
        index: true,
    })
    estado: EstadoSolicitud;

    @Prop({ type: DatosPersonales, required: true })
    datosPersonales: DatosPersonales;

    @Prop({ type: DatosLaborales, required: false })
    datosLaborales?: DatosLaborales;

    @Prop({ type: ProductoSolicitado, required: false })
    productoSolicitado?: ProductoSolicitado;

    @Prop({ type: [HistorialEstado], default: [] })
    historialEstados: HistorialEstado[];

    @Prop({ type: Validaciones, default: {} })
    validaciones: Validaciones;

    @Prop({ type: IntegracionCore, default: {} })
    integracionCore: IntegracionCore;

    @Prop({ type: Metadatos, required: true })
    metadatos: Metadatos;

    @Prop({ type: Auditoria, required: false })
    auditoria?: Auditoria;
}

export const SolicitudTarjetaCreditoSchema = SchemaFactory.createForClass(
    SolicitudTarjetaCredito,
);

// Indexes
SolicitudTarjetaCreditoSchema.index({ 'datosPersonales.email': 1 });
SolicitudTarjetaCreditoSchema.index({ 'datosPersonales.numeroDocumento': 1 });
SolicitudTarjetaCreditoSchema.index({ 'metadatos.creadoEn': -1 });
SolicitudTarjetaCreditoSchema.index({ estado: 1, 'metadatos.creadoEn': -1 });

// Pre-save middleware to update actualizadoEn
SolicitudTarjetaCreditoSchema.pre<SolicitudTarjetaCreditoDocument>('save', function (next) {
    if (this.metadatos) {
        this.metadatos.actualizadoEn = new Date();
    }
    next();
});
