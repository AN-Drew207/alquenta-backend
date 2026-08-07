import { Module } from '@nestjs/common';
import { PropertyRepository } from './domain/repositories/property.repository';
import { PrismaPropertyRepository } from './infrastructure/persistence/prisma-property.repository';
import { PublishPropertyUseCase } from './application/use-cases/publish-property/publish-property.use-case';
import { UpdatePropertyUseCase } from './application/use-cases/update-property/update-property.use-case';
import { DeletePropertyUseCase } from './application/use-cases/delete-property/delete-property.use-case';
import { ListPropertiesUseCase } from './application/use-cases/list-properties/list-properties.use-case';
import { GetPropertyByIdUseCase } from './application/use-cases/get-property-by-id/get-property-by-id.use-case';
import { PropertiesController } from './presentation/http/properties.controller';

@Module({
  controllers: [PropertiesController],
  providers: [
    { provide: PropertyRepository, useClass: PrismaPropertyRepository },
    PublishPropertyUseCase,
    UpdatePropertyUseCase,
    DeletePropertyUseCase,
    ListPropertiesUseCase,
    GetPropertyByIdUseCase,
  ],
  exports: [PropertyRepository],
})
export class PropertiesModule {}
