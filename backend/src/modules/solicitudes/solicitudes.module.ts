/**
 * Solicitudes Module - Clean Architecture
 * 
 * Wires together all layers following Dependency Inversion Principle.
 * Use Cases depend on Gateway interfaces, Infrastructure provides implementations.
 */

import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// Presentation Layer
import { SolicitudesController } from './presentation/solicitudes.controller';

// Application Layer - Use Cases
import {
    CreateSolicitudUseCase,
    SubmitSolicitudUseCase,
    FindSolicitudUseCase,
    ListSolicitudesUseCase,
    UpdateSolicitudUseCase,
    AbandonSolicitudUseCase,
} from './application/use-cases';

// Application Layer - Gateways (Ports)
import { SOLICITUD_GATEWAY } from './application/gateways/solicitud.gateway';

// Infrastructure Layer
import {
    SolicitudTarjetaCredito,
    SolicitudTarjetaCreditoSchema,
} from './infrastructure/schemas/solicitud-tarjeta.schema';
import { SolicitudMongoGateway } from './infrastructure/persistence/gateways/solicitud-mongo.gateway';
import { SolicitudMapper } from './infrastructure/persistence/mappers/solicitud.mapper';

// External Modules
import { IntegracionCoreModule } from '@modules/integracion-core/integracion-core.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: SolicitudTarjetaCredito.name,
                schema: SolicitudTarjetaCreditoSchema,
            },
        ]),
        forwardRef(() => IntegracionCoreModule), // Importar para usar CoreBankingService
    ],
    controllers: [SolicitudesController],
    providers: [
        // ============ Infrastructure Layer ============
        SolicitudMapper,
        {
            provide: SOLICITUD_GATEWAY,
            useClass: SolicitudMongoGateway,
        },

        // ============ Application Layer - Use Cases ============
        CreateSolicitudUseCase,
        SubmitSolicitudUseCase,
        FindSolicitudUseCase,
        ListSolicitudesUseCase,
        UpdateSolicitudUseCase,
        AbandonSolicitudUseCase,
    ],
    exports: [
        // Export Use Cases for other modules
        CreateSolicitudUseCase,
        FindSolicitudUseCase,
        ListSolicitudesUseCase,
        UpdateSolicitudUseCase,
        SubmitSolicitudUseCase,
        AbandonSolicitudUseCase,

        // Export Gateway for other modules that need direct access
        SOLICITUD_GATEWAY,
    ],
})
export class SolicitudesModule { }
