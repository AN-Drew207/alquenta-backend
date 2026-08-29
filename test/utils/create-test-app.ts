import { randomUUID } from 'node:crypto';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from '../../src/app.module';
import { DomainExceptionFilter } from '../../src/shared/presentation/filters/domain-exception.filter';
import { PrismaService } from '../../src/shared/infrastructure/prisma/prisma.service';
import { splitName } from '../../src/modules/auth/domain/entities/split-name';
import { PlanTier } from '../../src/modules/plans/domain/enums/plan-tier.enum';

/**
 * Mirrors prisma/seed.ts's plan catalog — CI's ephemeral Postgres never
 * runs `prisma db seed`, so tests that need a plan assigned upsert it
 * themselves here, by tier.
 */
const PLAN_DEFAULTS: Record<
  PlanTier,
  { name: string; monthlyPriceUsd: number; activeListingsLimit: number | null }
> = {
  [PlanTier.STARTER]: {
    name: 'Starter',
    monthlyPriceUsd: 15,
    activeListingsLimit: 10,
  },
  [PlanTier.PROFESSIONAL]: {
    name: 'Professional',
    monthlyPriceUsd: 30,
    activeListingsLimit: 22,
  },
  [PlanTier.BUSINESS]: {
    name: 'Business',
    monthlyPriceUsd: 50,
    activeListingsLimit: 45,
  },
  [PlanTier.ENTERPRISE]: {
    name: 'Enterprise',
    monthlyPriceUsd: 100,
    activeListingsLimit: null,
  },
};

export async function createTestApp(): Promise<INestApplication<App>> {
  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication<INestApplication<App>>();
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
 *
 * `tier` is optional and defaults to no plan assigned (`planId: null`) —
 * that's the behavior every pre-existing e2e spec already relies on, so
 * omitting it keeps them passing unmodified. Pass a tier for tests that
 * need an admin with an assigned subscription plan (e.g. analytics access).
 */
export async function seedAdmin(
  prisma: PrismaService,
  params: { email: string; password: string; name: string; tier?: PlanTier },
): Promise<void> {
  const { firstName, lastName } = splitName(params.name);

  let planId: string | null = null;
  if (params.tier) {
    const plan = await prisma.plan.upsert({
      where: { tier: params.tier },
      update: {},
      create: {
        id: randomUUID(),
        tier: params.tier,
        ...PLAN_DEFAULTS[params.tier],
      },
    });
    planId = plan.id;
  }

  await prisma.user.create({
    data: {
      id: randomUUID(),
      email: params.email,
      passwordHash: await bcrypt.hash(params.password, 10),
      name: params.name,
      firstName,
      lastName,
      role: 'ADMIN',
      planId,
    },
  });
}

export async function loginAndExtractCookie(
  app: INestApplication<App>,
  email: string,
  password: string,
): Promise<string> {
  const res = await request(app.getHttpServer())
    .post('/api/auth/login')
    .send({ email, password });
  return extractCookie(res.headers['set-cookie']);
}
