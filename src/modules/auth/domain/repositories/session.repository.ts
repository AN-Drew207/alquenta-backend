import { Session } from '../entities/session.entity';

export abstract class SessionRepository {
  abstract save(session: Session): Promise<void>;
  abstract findById(id: string): Promise<Session | null>;
  abstract findByUserId(userId: string): Promise<Session[]>;
  abstract delete(id: string): Promise<void>;
  abstract deleteAllForUserExcept(userId: string, exceptId: string): Promise<void>;
  abstract deleteAllForUser(userId: string): Promise<void>;
}
