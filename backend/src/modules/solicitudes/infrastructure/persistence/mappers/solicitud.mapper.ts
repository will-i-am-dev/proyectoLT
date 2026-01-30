/**
 * Solicitud Mapper - Infrastructure Layer
 * 
 * Converts between Domain Entity and Mongoose Document.
 * This adapter bridges the gap between the domain model and the persistence model.
 */

import { Injectable } from '@nestjs/common';
import {
    SolicitudEntity,
    SolicitudProps,
    DatosPersonales,
    DatosLaborales,
    ProductoSolicitado,
    Auditoria,
    Validaciones,
    IntegracionCore,
    HistorialEstado,
    Metadatos,
} from '../../../domain/entities/solicitud.entity';
import { SolicitudTarjetaCreditoDocument } from '../../schemas/solicitud-tarjeta.schema';
import { EstadoSolicitud } from '../../../domain/enums/estado-solicitud.enum';
import { Canal } from '../../../domain/enums/common.enum';

@Injectable()
export class SolicitudMapper {
    /**
     * Converts a Mongoose Document to a Domain Entity
     */
    toDomain(document: SolicitudTarjetaCreditoDocument): SolicitudEntity {
        const props: SolicitudProps = {
            id: document._id?.toString(),
            numeroSolicitud: document.numeroSolicitud,
            estado: document.estado as EstadoSolicitud,
            datosPersonales: this.mapDatosPersonales(document.datosPersonales),
            datosLaborales: this.mapDatosLaborales(document.datosLaborales),
            productoSolicitado: this.mapProductoSolicitado(document.productoSolicitado),
            auditoria: this.mapAuditoria(document.auditoria),
            validaciones: this.mapValidaciones(document.validaciones),
            integracionCore: this.mapIntegracionCore(document.integracionCore),
            historialEstados: this.mapHistorialEstados(document.historialEstados || []),
            metadatos: this.mapMetadatos(document.metadatos),
        };

        return new SolicitudEntity(props);
    }

    /**
     * Converts a Domain Entity to a plain object for persistence
     */
    toPersistence(entity: SolicitudEntity): Record<string, any> {
        const props = entity.toProps();

        return {
            numeroSolicitud: props.numeroSolicitud,
            estado: props.estado,
            datosPersonales: props.datosPersonales,
            datosLaborales: props.datosLaborales,
            productoSolicitado: props.productoSolicitado,
            auditoria: props.auditoria,
            validaciones: props.validaciones,
            integracionCore: props.integracionCore,
            historialEstados: props.historialEstados,
            metadatos: props.metadatos,
        };
    }

    private mapDatosPersonales(data: any): DatosPersonales {
        if (!data) return {} as DatosPersonales; // Datos personales suele ser obligatorio, pero para evitar crash retornamos vacío o parcial

        return {
            nombres: data.nombres,
            apellidos: data.apellidos,
            tipoDocumento: data.tipoDocumento,
            numeroDocumento: data.numeroDocumento,
            fechaNacimiento: data.fechaNacimiento ? new Date(data.fechaNacimiento) : new Date(),
            genero: data.genero,
            email: data.email,
            celular: data.celular,
            direccionResidencia: {
                calle: data.direccionResidencia?.calle || '',
                ciudad: data.direccionResidencia?.ciudad || '',
                departamento: data.direccionResidencia?.departamento || '',
                codigoPostal: data.direccionResidencia?.codigoPostal,
            },
        };
    }

    private mapDatosLaborales(data: any): DatosLaborales | undefined {
        if (!data) return undefined;
        return {
            situacionLaboral: data.situacionLaboral,
            tipoContrato: data.tipoContrato,
            nombreEmpresa: data.nombreEmpresa,
            cargoActual: data.cargoActual,
            antiguedadMeses: data.antiguedadMeses,
            ingresoMensual: data.ingresoMensual,
        };
    }

    private mapProductoSolicitado(data: any): ProductoSolicitado | undefined {
        if (!data) return undefined;
        return {
            tipoTarjeta: data.tipoTarjeta,
            cupoSolicitado: data.cupoSolicitado,
            franquicia: data.franquicia,
            segurosAdicionales: data.segurosAdicionales || false,
        };
    }

    private mapAuditoria(data: any): Auditoria | undefined {
        if (!data) return undefined;
        return {
            aceptaTerminos: data?.aceptaTerminos || false,
            fechaAceptacionTerminos: data?.fechaAceptacionTerminos
                ? new Date(data.fechaAceptacionTerminos)
                : undefined,
            aceptaTratamientoDatos: data?.aceptaTratamientoDatos || false,
            autorizaConsultaCentrales: data?.autorizaConsultaCentrales || false,
        };
    }

    private mapValidaciones(data: any): Validaciones | undefined {
        if (!data) return undefined;
        return {
            identidadValidada: data?.identidadValidada || false,
            centralesRiesgoConsultadas: data?.centralesRiesgoConsultadas || false,
            scoreCredito: data?.scoreCredito,
            nivelRiesgo: data?.nivelRiesgo,
            deudaActual: data?.deudaActual,
        };
    }

    private mapIntegracionCore(data: any): IntegracionCore | undefined {
        if (!data) return undefined;
        return {
            enviado: data?.enviado || false,
            fechaEnvio: data?.fechaEnvio ? new Date(data.fechaEnvio) : undefined,
            idSolicitudCore: data?.idSolicitudCore,
            estadoCore: data?.estadoCore,
            intentosEnvio: data?.intentosEnvio || 0,
            ultimoError: data?.ultimoError
                ? {
                    codigo: data.ultimoError.codigo,
                    mensaje: data.ultimoError.mensaje,
                    fecha: new Date(data.ultimoError.fecha),
                }
                : undefined,
        };
    }

    private mapHistorialEstados(data: any[]): HistorialEstado[] {
        return data.map((item) => ({
            estado: item.estado as EstadoSolicitud,
            fecha: new Date(item.fecha),
            observaciones: item.observaciones,
        }));
    }

    private mapMetadatos(data: any): Metadatos {
        return {
            creadoEn: new Date(data.creadoEn),
            actualizadoEn: new Date(data.actualizadoEn),
            ipOrigen: data.ipOrigen,
            userAgent: data.userAgent,
            canal: data.canal || Canal.WEB,
        };
    }
}
