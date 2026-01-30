import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '@shared/database/database.module';
import { LoggerModule } from '@shared/logger/logger.module';
import { SolicitudesModule } from '@modules/solicitudes/solicitudes.module';
import { IntegracionCoreModule } from '@modules/integracion-core/integracion-core.module';
import { HealthModule } from '@modules/health/health.module';

@Module({
    imports: [
        // Configuration
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),

        // Shared modules
        DatabaseModule,
        LoggerModule,

        // Feature modules
        SolicitudesModule,
        IntegracionCoreModule,
        HealthModule,
    ],
})
export class AppModule { }
