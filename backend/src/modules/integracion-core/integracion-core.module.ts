import { Module, forwardRef } from '@nestjs/common';
import { MulesoftMockController } from './controllers/mulesoft-mock.controller';
import { IntegracionCoreController } from './controllers/integracion-core.controller';
import { MulesoftClientService } from './services/mulesoft-client.service';
import { CoreBankingService } from './services/core-banking.service';
import { SolicitudesModule } from '@modules/solicitudes/solicitudes.module';

@Module({
    imports: [forwardRef(() => SolicitudesModule)],
    controllers: [MulesoftMockController, IntegracionCoreController],
    providers: [MulesoftClientService, CoreBankingService],
    exports: [CoreBankingService, MulesoftClientService],
})
export class IntegracionCoreModule { }
