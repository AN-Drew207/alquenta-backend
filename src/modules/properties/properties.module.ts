import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PlansModule } from '../plans/plans.module';
import { MediaModule } from '../media/media.module';
import { PropertyRepository } from './domain/repositories/property.repository';
import { PrismaPropertyRepository } from './infrastructure/persistence/prisma-property.repository';
import { PublishPropertyUseCase } from './application/use-cases/publish-property/publish-property.use-case';
import { UpdatePropertyUseCase } from './application/use-cases/update-property/update-property.use-case';
import { DeletePropertyUseCase } from './application/use-cases/delete-property/delete-property.use-case';
import { ListPropertiesUseCase } from './application/use-cases/list-properties/list-properties.use-case';
import { GetPropertyByIdUseCase } from './application/use-cases/get-property-by-id/get-property-by-id.use-case';
import { CancelPropertyUseCase } from './application/use-cases/cancel-property/cancel-property.use-case';
import { PurgeStaleCancelledPropertiesUseCase } from './application/use-cases/purge-stale-cancelled-properties/purge-stale-cancelled-properties.use-case';
import { CancelledPropertiesCleanupTask } from './application/tasks/cancelled-properties-cleanup.task';
import { PropertiesController } from './presentation/http/properties.controller';

@Module({
  imports: [AuthModule, PlansModule, MediaModule],
  controllers: [PropertiesController],
  providers: [
    { provide: PropertyRepository, useClass: PrismaPropertyRepository },
    PublishPropertyUseCase,
    UpdatePropertyUseCase,
    DeletePropertyUseCase,
    ListPropertiesUseCase,
    GetPropertyByIdUseCase,
    CancelPropertyUseCase,
    PurgeStaleCancelledPropertiesUseCase,
    CancelledPropertiesCleanupTask,
  ],
  exports: [PropertyRepository],
})
export class PropertiesModule {}
