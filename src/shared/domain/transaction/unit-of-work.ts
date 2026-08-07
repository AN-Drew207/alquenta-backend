import { TransactionContext } from './transaction-context';

export abstract class UnitOfWork {
  abstract runInTransaction<T>(
    work: (ctx: TransactionContext) => Promise<T>,
  ): Promise<T>;
}
