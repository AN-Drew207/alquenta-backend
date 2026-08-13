import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { Session } from '../../domain/entities/session.entity';
import { SessionRepository } from '../../domain/repositories/session.repository';
import { SessionMapper } from './session.mapper';

@Injectable()
export class PrismaSessionRepository implements SessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(session: Session): Promise<void> {
    await this.prisma.session.upsert({
      where: { id: session.id },
      create: {
        id: session.id,
        userId: session.userId,
        userAgent: session.userAgent,
        ip: session.ip,
        createdAt: session.createdAt,
        lastActiveAt: session.lastActiveAt,
      },
      update: {
        lastActiveAt: session.lastActiveAt,
      },
    });
  }

  async findById(id: string): Promise<Session | null> {
    const row = await this.prisma.session.findUnique({ where: { id } });
    return row ? SessionMapper.toDomain(row) : null;
  }

  async findByUserId(userId: string): Promise<Session[]> {
    const rows = await this.prisma.session.findMany({
      where: { userId },
      orderBy: { lastActiveAt: 'desc' },
    });
    return rows.map(SessionMapper.toDomain);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.session.deleteMany({ where: { id } });
  }

  async deleteAllForUserExcept(userId: string, exceptId: string): Promise<void> {
    await this.prisma.session.deleteMany({
      where: { userId, NOT: { id: exceptId } },
    });
  }

  async deleteAllForUser(userId: string): Promise<void> {
    await this.prisma.session.deleteMany({ where: { userId } });
  }
}
