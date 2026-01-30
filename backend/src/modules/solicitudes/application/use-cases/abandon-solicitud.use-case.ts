/**
 * Abandon Solicitud Use Case - Application Layer
 * 
 * Handles abandoning a solicitud.
 */

import { Injectable, Inject, BadRequestException, NotFoundException } from '@nestjs/common';
import { SolicitudEntity } from '../../domain/entities/solicitud.entity';
import { ISolicitudGateway, SOLICITUD_GATEWAY } from '../gateways/solicitud.gateway';

@Injectable()
export class AbandonSolicitudUseCase {
    constructor(
        @Inject(SOLICITUD_GATEWAY)
        private readonly solicitudGateway: ISolicitudGateway,
    ) { }

    async execute(id: string): Promise<SolicitudEntity> {
        // 1. Find entity
        const entity = await this.solicitudGateway.findById(id);
        if (!entity) {
            throw new NotFoundException(`Solicitud con ID ${id} no encontrada`);
        }

        // 2. Validate can be abandoned (Domain behavior)
        if (!entity.canBeAbandoned()) {
            throw new BadRequestException('No se pueden abandonar solicitudes aprobadas o rechazadas');
        }

        // 3. Abandon (Domain state transition)
        entity.abandon();

        // 4. Persist changes
        return await this.solicitudGateway.update(entity);
    }
}
