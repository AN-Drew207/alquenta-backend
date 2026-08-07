import { TransactionContext } from '../../../../shared/domain/transaction/transaction-context';
import { User } from '../entities/user.entity';

export abstract class UserRepository {
  abstract save(user: User, ctx?: TransactionContext): Promise<void>;
  abstract findByEmail(email: string): Promise<User | null>;
  abstract findById(id: string): Promise<User | null>;
}
