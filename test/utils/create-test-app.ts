import { randomUUID } from 'node:crypto';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { DomainExceptionFilter } from '../../src/shared/presentation/filters/domain-exception.filter';
import { PrismaService } from '../../src/shared/infrastructure/prisma/prisma.service';
import { splitName } from '../../src/modules/auth/domain/entities/split-name';

export async function createTestApp(): Promise<INestApplication> {
  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  app.setGlobalPrefix('api');
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new DomainExceptionFilter());
  await app.init();
  return app;
}

export function extractCookie(
  setCookieHeader: string | string[] | undefined,
): string {
  const cookies = Array.isArray(setCookieHeader)
    ? setCookieHeader
    : setCookieHeader
      ? [setCookieHeader]
      : [];
  const cookie = cookies.find((c) => c.startsWith('access_token='));
  if (!cookie) {
    throw new Error('access_token cookie not found in response');
  }
  return cookie.split(';')[0];
}

/**
 * ADMIN accounts have no public registration endpoint (they are onboarded
 * manually) — this seeds one directly through Prisma for test setup.
 */
export async function seedAdmin(
  prisma: PrismaService,
  params: { email: string; password: string; name: string },
): Promise<void> {
  const { firstName, lastName } = splitName(params.name);
  await prisma.user.create({
    data: {
      id: randomUUID(),
      email: params.email,
      passwordHash: await bcrypt.hash(params.password, 10),
      name: params.name,
      firstName,
      lastName,
      role: 'ADMIN',
    },
  });
}

export async function loginAndExtractCookie(
  app: INestApplication,
  email: string,
  password: string,
): Promise<string> {
  const res = await request(app.getHttpServer())
    .post('/api/auth/login')
    .send({ email, password });
  return extractCookie(res.headers['set-cookie']);
}
