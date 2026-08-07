import { Global, Module } from '@nestjs/common';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { PrismaUnitOfWork } from './infrastructure/prisma/prisma-unit-of-work';
import { UnitOfWork } from './domain/transaction/unit-of-work';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [{ provide: UnitOfWork, useClass: PrismaUnitOfWork }],
  exports: [PrismaModule, UnitOfWork],
})
export class SharedModule {}
