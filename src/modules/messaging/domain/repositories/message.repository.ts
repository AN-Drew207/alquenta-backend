import { TransactionContext } from '../../../../shared/domain/transaction/transaction-context';
import { Message } from '../entities/message.entity';

export abstract class MessageRepository {
  abstract save(message: Message, ctx?: TransactionContext): Promise<void>;
  abstract findManyByConversation(conversationId: string): Promise<Message[]>;
}
