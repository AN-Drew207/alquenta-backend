import { TransactionContext } from '../../../../shared/domain/transaction/transaction-context';
import { Conversation } from '../entities/conversation.entity';

export abstract class ConversationRepository {
  abstract findOrCreate(
    candidate: Conversation,
    ctx?: TransactionContext,
  ): Promise<Conversation>;
  abstract findById(id: string): Promise<Conversation | null>;
  abstract findManyByUser(userId: string): Promise<Conversation[]>;
  abstract findManyByAdminId(adminId: string): Promise<Conversation[]>;
}
