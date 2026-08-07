import { Injectable } from '@nestjs/common';
import { UnitOfWork } from '../../domain/transaction/unit-of-work';
import { TransactionContext } from '../../domain/transaction/transaction-context';
import { PrismaService } from './prisma.service';

@Injectable()
export class PrismaUnitOfWork implements UnitOfWork {
  constructor(private readonly prisma: PrismaService) {}

  async runInTransaction<T>(
    work: (ctx: TransactionContext) => Promise<T>,
  ): Promise<T> {
    return this.prisma.$transaction((tx) => work(tx as TransactionContext));
  }
}
