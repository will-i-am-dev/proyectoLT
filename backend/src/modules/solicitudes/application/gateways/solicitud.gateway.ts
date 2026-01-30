/**
 * Solicitud Gateway (Port) - Application Layer
 * 
 * Interface that defines how the Application Layer interacts with
 * persistence. Infrastructure implements this interface.
 * 
 * Following Clean Architecture: Use Cases depend on this abstraction,
 * not on concrete implementations.
 */

import { SolicitudEntity } from '../../domain/entities/solicitud.entity';
import { EstadoSolicitud } from '../../domain/enums/estado-solicitud.enum';

export interface PaginatedResult<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
}

export interface SolicitudFilters {
    estado?: EstadoSolicitud;
    tipoTarjeta?: string;
    fechaDesde?: Date;
    fechaHasta?: Date;
    email?: string;
    numeroDocumento?: string;
}

export interface PaginationOptions {
    page: number;
    limit: number;
}

export const SOLICITUD_GATEWAY = Symbol('SOLICITUD_GATEWAY');

export interface ISolicitudGateway {
    /**
     * Persist a new solicitud entity
     */
    save(entity: SolicitudEntity): Promise<SolicitudEntity>;

    /**
     * Find solicitud by ID
     */
    findById(id: string): Promise<SolicitudEntity | null>;

    /**
     * Find solicitud by numero de solicitud
     */
    findByNumeroSolicitud(numeroSolicitud: string): Promise<SolicitudEntity | null>;

    /**
     * Find all solicitudes with filters and pagination
     */
    findAll(
        filters: SolicitudFilters,
        pagination: PaginationOptions,
    ): Promise<PaginatedResult<SolicitudEntity>>;

    /**
     * Update an existing solicitud
     */
    update(entity: SolicitudEntity): Promise<SolicitudEntity>;

    /**
     * Delete a solicitud by ID
     */
    delete(id: string): Promise<boolean>;

    /**
     * Generate unique solicitud number
     */
    generateNumeroSolicitud(): Promise<string>;
}
