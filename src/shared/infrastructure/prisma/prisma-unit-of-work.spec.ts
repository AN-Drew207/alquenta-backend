import 'dotenv/config';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '../../../../generated/prisma/client';
import { PrismaService } from './prisma.service';
import { PrismaUnitOfWork } from './prisma-unit-of-work';

describe('PrismaUnitOfWork', () => {
  let prisma: PrismaService;
  let unitOfWork: PrismaUnitOfWork;

  beforeAll(async () => {
    const configService = {
      get: (key: string) => process.env[key],
    } as ConfigService;
    prisma = new PrismaService(configService);
    await prisma.$connect();
    unitOfWork = new PrismaUnitOfWork(prisma);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('rolls back changes when the work inside the transaction fails', async () => {
    const email = `rollback-test-${Date.now()}@example.com`;

    await expect(
      unitOfWork.runInTransaction(async (ctx) => {
        const tx = ctx as Prisma.TransactionClient;
        await tx.user.create({
          data: {
            email,
            passwordHash: 'x',
            name: 'Rollback Test',
            firstName: 'Rollback',
            lastName: 'Test',
            role: 'CLIENT',
          },
        });
        throw new Error('forced to test rollback');
      }),
    ).rejects.toThrow('forced to test rollback');

    const found = await prisma.user.findUnique({ where: { email } });
    expect(found).toBeNull();
  });
});
