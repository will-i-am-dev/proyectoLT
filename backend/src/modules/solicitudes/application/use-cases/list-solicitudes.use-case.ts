/**
 * List Solicitudes Use Case - Application Layer
 * 
 * Retrieves paginated list of solicitudes with optional filters.
 */

import { Injectable, Inject } from '@nestjs/common';
import { SolicitudEntity } from '../../domain/entities/solicitud.entity';
import {
    ISolicitudGateway,
    SOLICITUD_GATEWAY,
    SolicitudFilters,
    PaginationOptions,
    PaginatedResult,
} from '../gateways/solicitud.gateway';

export interface ListSolicitudesOutput {
    data: SolicitudEntity[];
    meta: {
        total: number;
        page: number;
        limit: number;
        pages: number;
    };
}

@Injectable()
export class ListSolicitudesUseCase {
    constructor(
        @Inject(SOLICITUD_GATEWAY)
        private readonly solicitudGateway: ISolicitudGateway,
    ) { }

    async execute(
        filters: SolicitudFilters = {},
        pagination: PaginationOptions = { page: 1, limit: 10 },
    ): Promise<ListSolicitudesOutput> {
        const result = await this.solicitudGateway.findAll(filters, pagination);

        return {
            data: result.data,
            meta: {
                total: result.total,
                page: result.page,
                limit: result.limit,
                pages: Math.ceil(result.total / result.limit),
            },
        };
    }
}
