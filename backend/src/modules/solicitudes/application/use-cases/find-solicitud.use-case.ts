/**
 * Find Solicitud Use Case - Application Layer
 * 
 * Retrieves a single solicitud by ID.
 */

import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { SolicitudEntity } from '../../domain/entities/solicitud.entity';
import { ISolicitudGateway, SOLICITUD_GATEWAY } from '../gateways/solicitud.gateway';

@Injectable()
export class FindSolicitudUseCase {
    constructor(
        @Inject(SOLICITUD_GATEWAY)
        private readonly solicitudGateway: ISolicitudGateway,
    ) { }

    async execute(id: string): Promise<SolicitudEntity> {
        const entity = await this.solicitudGateway.findById(id);
        if (!entity) {
            throw new NotFoundException(`Solicitud con ID ${id} no encontrada`);
        }
        return entity;
    }
}
