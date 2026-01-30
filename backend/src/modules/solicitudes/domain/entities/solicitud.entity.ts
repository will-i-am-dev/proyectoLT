/**
 * Solicitud Entity - Domain Layer
 * 
 * Core business entity representing a credit card application.
 * Contains domain behavior and business invariants.
 */

import { EstadoSolicitud, NivelRiesgo } from '../enums/estado-solicitud.enum';
import { TipoDocumento, Genero, SituacionLaboral, TipoContrato, TipoTarjeta, Franquicia, Canal } from '../enums/common.enum';

// ============ Value Objects ============

export interface DireccionResidencia {
    calle: string;
    ciudad: string;
    departamento: string;
    codigoPostal?: string;
}

export interface DatosPersonales {
    nombres: string;
    apellidos: string;
    tipoDocumento: TipoDocumento;
    numeroDocumento: string;
    fechaNacimiento: Date;
    genero: Genero;
    email: string;
    celular: string;
    direccionResidencia: DireccionResidencia;
}

export interface DatosLaborales {
    situacionLaboral?: SituacionLaboral;
    tipoContrato?: TipoContrato;
    nombreEmpresa?: string;
    cargoActual?: string;
    antiguedadMeses?: number;
    ingresoMensual?: number;
}

export interface ProductoSolicitado {
    tipoTarjeta?: TipoTarjeta;
    cupoSolicitado?: number;
    franquicia?: Franquicia;
    segurosAdicionales?: boolean;
}

export interface Auditoria {
    aceptaTerminos?: boolean;
    fechaAceptacionTerminos?: Date;
    aceptaTratamientoDatos?: boolean;
    autorizaConsultaCentrales?: boolean;
}

export interface Validaciones {
    identidadValidada: boolean;
    centralesRiesgoConsultadas: boolean;
    scoreCredito?: number;
    nivelRiesgo?: NivelRiesgo;
    deudaActual?: number;
}

export interface IntegracionCore {
    enviado: boolean;
    fechaEnvio?: Date;
    idSolicitudCore?: string;
    estadoCore?: string;
    intentosEnvio: number;
    ultimoError?: {
        codigo: string;
        mensaje: string;
        fecha: Date;
    };
}

export interface HistorialEstado {
    estado: EstadoSolicitud;
    fecha: Date;
    observaciones?: string;
}

export interface Metadatos {
    creadoEn: Date;
    actualizadoEn: Date;
    ipOrigen?: string;
    userAgent?: string;
    canal: Canal;
}

// ============ Entity ============

export interface SolicitudProps {
    id?: string;
    numeroSolicitud: string;
    estado: EstadoSolicitud;
    datosPersonales: DatosPersonales;
    datosLaborales?: DatosLaborales;
    productoSolicitado?: ProductoSolicitado;
    auditoria?: Auditoria;
    validaciones: Validaciones;
    integracionCore: IntegracionCore;
    historialEstados: HistorialEstado[];
    metadatos: Metadatos;
}

export class SolicitudEntity {
    private props: SolicitudProps;

    constructor(props: SolicitudProps) {
        this.props = props;
    }

    // ============ Getters ============

    get id(): string | undefined {
        return this.props.id;
    }

    get numeroSolicitud(): string {
        return this.props.numeroSolicitud;
    }

    get estado(): EstadoSolicitud {
        return this.props.estado;
    }

    get datosPersonales(): DatosPersonales {
        return this.props.datosPersonales;
    }

    get datosLaborales(): DatosLaborales | undefined {
        return this.props.datosLaborales;
    }

    get productoSolicitado(): ProductoSolicitado | undefined {
        return this.props.productoSolicitado;
    }

    get auditoria(): Auditoria | undefined {
        return this.props.auditoria;
    }

    get validaciones(): Validaciones {
        return this.props.validaciones;
    }

    get integracionCore(): IntegracionCore {
        return this.props.integracionCore;
    }

    get historialEstados(): HistorialEstado[] {
        return this.props.historialEstados;
    }

    get metadatos(): Metadatos {
        return this.props.metadatos;
    }

    // ============ Domain Behavior ============

    isDraft(): boolean {
        return this.props.estado === EstadoSolicitud.DRAFT;
    }

    canBeUpdated(): boolean {
        return this.isDraft();
    }

    canBeSubmitted(): boolean {
        return this.isDraft() && this.hasAcceptedTerms();
    }

    canBeAbandoned(): boolean {
        return this.props.estado !== EstadoSolicitud.APPROVED &&
            this.props.estado !== EstadoSolicitud.REJECTED;
    }

    hasAcceptedTerms(): boolean {
        return !!(this.props.auditoria?.aceptaTerminos &&
            this.props.auditoria?.aceptaTratamientoDatos &&
            this.props.auditoria?.autorizaConsultaCentrales);
    }

    // ============ State Transitions ============

    submit(): void {
        if (!this.canBeSubmitted()) {
            throw new Error('Solicitud cannot be submitted in current state');
        }
        this.changeState(EstadoSolicitud.SUBMITTED, 'Solicitud enviada para revisión');
    }

    abandon(): void {
        if (!this.canBeAbandoned()) {
            throw new Error('Solicitud cannot be abandoned in current state');
        }
        this.changeState(EstadoSolicitud.ABANDONED, 'Solicitud abandonada por el usuario');
    }

    approve(observaciones?: string): void {
        this.changeState(EstadoSolicitud.APPROVED, observaciones || 'Solicitud aprobada');
    }

    reject(observaciones?: string): void {
        this.changeState(EstadoSolicitud.REJECTED, observaciones || 'Solicitud rechazada');
    }

    sendToReview(observaciones?: string): void {
        this.changeState(EstadoSolicitud.IN_REVIEW, observaciones || 'Solicitud en revisión manual');
    }

    revertToDraft(observaciones?: string): void {
        this.changeState(EstadoSolicitud.DRAFT, observaciones || 'Solicitud revertida a borrador');
    }

    private changeState(newState: EstadoSolicitud, observaciones: string): void {
        this.props.estado = newState;
        this.props.historialEstados.push({
            estado: newState,
            fecha: new Date(),
            observaciones,
        });
        this.props.metadatos.actualizadoEn = new Date();
    }

    // ============ Update Methods ============

    updateDatosPersonales(datos: Partial<DatosPersonales>): void {
        if (!this.canBeUpdated()) {
            throw new Error('Cannot update solicitud in current state');
        }
        this.props.datosPersonales = { ...this.props.datosPersonales, ...datos };
        this.props.metadatos.actualizadoEn = new Date();
    }

    updateDatosLaborales(datos: Partial<DatosLaborales>): void {
        if (!this.canBeUpdated()) {
            throw new Error('Cannot update solicitud in current state');
        }
        this.props.datosLaborales = { ...this.props.datosLaborales, ...datos };
        this.props.metadatos.actualizadoEn = new Date();
    }

    updateProductoSolicitado(datos: Partial<ProductoSolicitado>): void {
        if (!this.canBeUpdated()) {
            throw new Error('Cannot update solicitud in current state');
        }
        this.props.productoSolicitado = { ...this.props.productoSolicitado, ...datos };
        this.props.metadatos.actualizadoEn = new Date();
    }

    updateAuditoria(datos: Partial<Auditoria>): void {
        if (!this.canBeUpdated()) {
            throw new Error('Cannot update solicitud in current state');
        }
        this.props.auditoria = { ...this.props.auditoria, ...datos };
        this.props.metadatos.actualizadoEn = new Date();
    }

    // ============ Validation Updates ============

    markIdentityValidated(validated: boolean, idClienteCore?: string): void {
        this.props.validaciones.identidadValidada = validated;
        if (idClienteCore) {
            this.props.integracionCore.idSolicitudCore = idClienteCore;
        }
        this.props.metadatos.actualizadoEn = new Date();
    }

    updateCreditScore(score: number, nivelRiesgo: NivelRiesgo, deudaActual: number): void {
        this.props.validaciones.centralesRiesgoConsultadas = true;
        this.props.validaciones.scoreCredito = score;
        this.props.validaciones.nivelRiesgo = nivelRiesgo;
        this.props.validaciones.deudaActual = deudaActual;
        this.props.metadatos.actualizadoEn = new Date();
    }

    // ============ Core Integration ============

    markSentToCore(idSolicitudCore: string, estadoCore: string): void {
        this.props.integracionCore.enviado = true;
        this.props.integracionCore.fechaEnvio = new Date();
        this.props.integracionCore.idSolicitudCore = idSolicitudCore;
        this.props.integracionCore.estadoCore = estadoCore;
        this.props.integracionCore.intentosEnvio++;
        this.props.metadatos.actualizadoEn = new Date();
    }

    recordCoreError(codigo: string, mensaje: string): void {
        this.props.integracionCore.intentosEnvio++;
        this.props.integracionCore.ultimoError = {
            codigo,
            mensaje,
            fecha: new Date(),
        };
        this.props.metadatos.actualizadoEn = new Date();
    }

    updateCoreStatus(estadoCore: string): void {
        this.props.integracionCore.estadoCore = estadoCore;
        this.props.metadatos.actualizadoEn = new Date();
    }

    // ============ Serialization ============

    toProps(): SolicitudProps {
        return { ...this.props };
    }
}
