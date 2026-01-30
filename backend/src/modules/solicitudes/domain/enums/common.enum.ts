export enum TipoDocumento {
    CC = 'CC', // Cédula de Ciudadanía
    CE = 'CE', // Cédula de Extranjería
    PAS = 'PAS', // Pasaporte
    NIT = 'NIT', // Número de Identificación Tributaria
}

export enum Genero {
    M = 'M', // Masculino
    F = 'F', // Femenino
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

export enum Canal {
    WEB = 'WEB',
    MOBILE = 'MOBILE',
    CALL_CENTER = 'CALL_CENTER',
}
