import { Session as PrismaSession } from '../../../../../generated/prisma/client';
import { Session } from '../../domain/entities/session.entity';

export class SessionMapper {
  static toDomain(row: PrismaSession): Session {
    return Session.reconstitute({
      id: row.id,
      userId: row.userId,
      userAgent: row.userAgent,
      ip: row.ip,
      createdAt: row.createdAt,
      lastActiveAt: row.lastActiveAt,
    });
  }
}
