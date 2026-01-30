/**
 * Tipos TypeScript para Solicitud de Tarjeta de Crédito
 * Reflejan los DTOs del backend
 */

// ============ Enums ============

export enum TipoDocumento {
    CC = 'CC', // Cédula de Ciudadanía
    CE = 'CE', // Cédula de Extranjería
    PAS = 'PAS', // Pasaporte
    NIT = 'NIT', // Número de Identificación Tributaria
}

export enum Genero {
    M = 'M',
    F = 'F',
    OTRO = 'OTRO',
    PREFIERO_NO_DECIR = 'PREFIERO_NO_DECIR',
}

export enum SituacionLaboral {
    EMPLEADO = 'EMPLEADO',
    INDEPENDIENTE = 'INDEPENDIENTE',
    PENSIONADO = 'PENSIONADO',
    OTRO = 'OTRO',
}

export enum TipoContrato {
    INDEFINIDO = 'INDEFINIDO',
    FIJO = 'FIJO',
    PRESTACION_SERVICIOS = 'PRESTACION_SERVICIOS',
    NA = 'N/A',
}

export enum TipoTarjeta {
    CLASICA = 'CLASICA',
    ORO = 'ORO',
    PLATINUM = 'PLATINUM',
    BLACK = 'BLACK',
}

export enum Franquicia {
    VISA = 'VISA',
    MASTERCARD = 'MASTERCARD',
}

export enum EstadoSolicitud {
    DRAFT = 'draft',
    SUBMITTED = 'submitted',
    IN_REVIEW = 'in_review',
    PENDING_VALIDATION = 'pending_validation',
    APPROVED = 'approved',
    REJECTED = 'rejected',
    ABANDONED = 'abandoned',
}

// ============ Interfaces ============

export interface DireccionResidencia {
    calle: string;
    ciudad: string;
    departamento: string;
    codigoPostal: string;
}

export interface DatosPersonales {
    nombres: string;
    apellidos: string;
    tipoDocumento: TipoDocumento;
    numeroDocumento: string;
    fechaNacimiento: string; // ISO date string
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
    otrosIngresos?: number;
}

export interface ProductoSolicitado {
    tipoTarjeta?: TipoTarjeta;
    cupoSolicitado?: number;
    franquicia?: Franquicia;
    segurosAdicionales?: boolean;
}

export interface Auditoria {
    aceptaTerminos?: boolean;
    aceptaTratamientoDatos?: boolean;
    autorizaConsultaCentrales?: boolean;
}

// ============ DTOs ============

export interface CreateSolicitudDto {
    datosPersonales: DatosPersonales;
    datosLaborales: DatosLaborales;
    productoSolicitado: ProductoSolicitado;
    auditoria: Auditoria;
}

export interface UpdateSolicitudDto {
    datosPersonales?: Partial<DatosPersonales>;
    datosLaborales?: Partial<DatosLaborales>;
    productoSolicitado?: Partial<ProductoSolicitado>;
    auditoria?: Partial<Auditoria>;
}

export interface SolicitudResponse {
    id: string;
    numeroSolicitud: string;
    estado: EstadoSolicitud;
    datosPersonales: DatosPersonales;
    datosLaborales: DatosLaborales;
    productoSolicitado: ProductoSolicitado;
    auditoria: Auditoria;
    metadatos: {
        creadoEn: string;
        actualizadoEn: string;
    };
}

// ============ Form State ============

export interface FormState {
    currentStep: number;
    solicitudId: string | null;
    datosPersonales: Partial<DatosPersonales>;
    datosLaborales: Partial<DatosLaborales>;
    productoSolicitado: Partial<ProductoSolicitado>;
    auditoria: Partial<Auditoria>;
    isLoading: boolean;
    error: string | null;
    lastSaved: Date | null;
}

// ============ UI Types ============

export interface StepInfo {
    number: number;
    title: string;
    description: string;
    isCompleted: boolean;
    isActive: boolean;
}

export interface TarjetaInfo {
    tipo: TipoTarjeta;
    nombre: string;
    cupoMaximo: number;
    ingresoMinimo: number;
    beneficios: string[];
    colorGradient: string;
}
