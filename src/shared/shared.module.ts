import { Global, Module } from '@nestjs/common';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { PrismaUnitOfWork } from './infrastructure/prisma/prisma-unit-of-work';
import { UnitOfWork } from './domain/transaction/unit-of-work';
import { EmailSender } from './domain/ports/email-sender';
import { ResendEmailSender } from './infrastructure/email/resend-email-sender';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [
    { provide: UnitOfWork, useClass: PrismaUnitOfWork },
    { provide: EmailSender, useClass: ResendEmailSender },
  ],
  exports: [PrismaModule, UnitOfWork, EmailSender],
})
export class SharedModule {}
