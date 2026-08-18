import { randomUUID } from 'node:crypto';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import {
  createTestApp,
  extractCookie,
  loginAndExtractCookie,
  seedAdmin,
} from './utils/create-test-app';
import { PrismaService } from '../src/shared/infrastructure/prisma/prisma.service';
import { PlanTier } from '../src/modules/plans/domain/enums/plan-tier.enum';

/** Creates a minimal property owned by the given (already-cookied) admin. */
async function createAnalyticsProperty(
  app: INestApplication<App>,
  cookie: string,
  title: string,
): Promise<string> {
  const res = await request(app.getHttpServer())
    .post('/api/properties')
    .set('Cookie', cookie)
    .send({
      title,
      description: 'desc',
      address: 'addr',
      state: 'Miranda',
      municipality: 'Baruta',
      type: 'APARTMENT',
      operationType: 'RENT',
      price: 500,
      images: ['https://example.com/photo.jpg'],
      whatsapp: '+58 412 1234567',
    });
  return (res.body as { id: string }).id;
}

function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

/**
 * Writes a PropertyAnalyticsEvent row directly via Prisma with a fixed
 * `occurredAt` — used to test date-window correctness (trend) and
 * deviceType grouping (device breakdown) without waiting real time.
 */
async function seedAnalyticsEvent(
  prisma: PrismaService,
  params: {
    propertyId: string;
    type: 'VIEW' | 'WHATSAPP_REVEAL' | 'MESSAGE_STARTED';
    deviceType?: 'MOBILE' | 'DESKTOP' | 'UNKNOWN' | null;
    occurredAt: Date;
  },
): Promise<void> {
  await prisma.propertyAnalyticsEvent.create({
    data: {
      id: randomUUID(),
      propertyId: params.propertyId,
      type: params.type,
      deviceType: params.deviceType ?? null,
      occurredAt: params.occurredAt,
    },
  });
}

describe('Analytics (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let starterAdminCookie: string;
  let noPlanAdminCookie: string;
  let otherAdminCookie: string;
  let clientCookie: string;
  let propertyId: string;

  // Fase 2 fixtures
  let professionalAdminCookie: string;
  let businessAdminCookie: string;
  let enterpriseAdminCookie: string;
  let otherProfessionalAdminCookie: string;
  let professionalPropertyId: string;
  let professionalPropertyId2: string;
  let deviceBreakdownPropertyId: string;
  let businessPropertyId: string;
  let enterprisePropertyId: string;

  const starterAdminEmail = 'starter-admin@e2e-analytics.test';
  const noPlanAdminEmail = 'no-plan-admin@e2e-analytics.test';
  const otherAdminEmail = 'other-admin@e2e-analytics.test';
  const clientEmail = 'client@e2e-analytics.test';
  const professionalAdminEmail = 'professional-admin@e2e-analytics.test';
  const businessAdminEmail = 'business-admin@e2e-analytics.test';
  const enterpriseAdminEmail = 'enterprise-admin@e2e-analytics.test';
  const otherProfessionalAdminEmail =
    'other-professional-admin@e2e-analytics.test';
  const password = 'password123';

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);

    await seedAdmin(prisma, {
      email: starterAdminEmail,
      password,
      name: 'Starter Admin',
      tier: PlanTier.STARTER,
    });
    starterAdminCookie = await loginAndExtractCookie(
      app,
      starterAdminEmail,
      password,
    );

    await seedAdmin(prisma, {
      email: noPlanAdminEmail,
      password,
      name: 'No Plan Admin',
    });
    noPlanAdminCookie = await loginAndExtractCookie(
      app,
      noPlanAdminEmail,
      password,
    );

    // Assigned a plan too, so the ownership-rejection test below is
    // guaranteed to fail on the ownership check, not the access gate.
    await seedAdmin(prisma, {
      email: otherAdminEmail,
      password,
      name: 'Other Admin',
      tier: PlanTier.STARTER,
    });
    otherAdminCookie = await loginAndExtractCookie(
      app,
      otherAdminEmail,
      password,
    );

    const registerClient = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ email: clientEmail, password, name: 'Analytics Client' });
    clientCookie = extractCookie(registerClient.headers['set-cookie']);

    const property = await request(app.getHttpServer())
      .post('/api/properties')
      .set('Cookie', starterAdminCookie)
      .send({
        title: 'E2E Analytics Property',
        description: 'desc',
        address: 'addr',
        state: 'Miranda',
        municipality: 'Baruta',
        type: 'APARTMENT',
        operationType: 'RENT',
        price: 500,
        images: ['https://example.com/photo.jpg'],
        whatsapp: '+58 412 1234567',
      });
    propertyId = (property.body as { id: string }).id;

    // --- Fase 2 fixtures ---
    await seedAdmin(prisma, {
      email: professionalAdminEmail,
      password,
      name: 'Professional Admin',
      tier: PlanTier.PROFESSIONAL,
    });
    professionalAdminCookie = await loginAndExtractCookie(
      app,
      professionalAdminEmail,
      password,
    );

    await seedAdmin(prisma, {
      email: businessAdminEmail,
      password,
      name: 'Business Admin',
      tier: PlanTier.BUSINESS,
    });
    businessAdminCookie = await loginAndExtractCookie(
      app,
      businessAdminEmail,
      password,
    );

    await seedAdmin(prisma, {
      email: enterpriseAdminEmail,
      password,
      name: 'Enterprise Admin',
      tier: PlanTier.ENTERPRISE,
    });
    enterpriseAdminCookie = await loginAndExtractCookie(
      app,
      enterpriseAdminEmail,
      password,
    );

    // PROFESSIONAL too, so the ownership-rejection tests below are
    // guaranteed to fail on the ownership check, not the access gate.
    await seedAdmin(prisma, {
      email: otherProfessionalAdminEmail,
      password,
      name: 'Other Professional Admin',
      tier: PlanTier.PROFESSIONAL,
    });
    otherProfessionalAdminCookie = await loginAndExtractCookie(
      app,
      otherProfessionalAdminEmail,
      password,
    );

    professionalPropertyId = await createAnalyticsProperty(
      app,
      professionalAdminCookie,
      'Professional Trend Property',
    );
    professionalPropertyId2 = await createAnalyticsProperty(
      app,
      professionalAdminCookie,
      'Professional Ranking Property 2',
    );
    deviceBreakdownPropertyId = await createAnalyticsProperty(
      app,
      professionalAdminCookie,
      'Device Breakdown Property',
    );
    businessPropertyId = await createAnalyticsProperty(
      app,
      businessAdminCookie,
      'Business Trend Property',
    );
    enterprisePropertyId = await createAnalyticsProperty(
      app,
      enterpriseAdminCookie,
      'Enterprise Trend Property',
    );

    // Fixed-timestamp VIEW events at day-5/20/40/100 relative to "now", on
    // one property per tier, to test trend date-window correctness:
    // PROFESSIONAL should only see day-5/20 (last 30 days), BUSINESS should
    // also see day-40 (last 90 days), ENTERPRISE should see all four (full
    // history).
    for (const targetPropertyId of [
      professionalPropertyId,
      businessPropertyId,
      enterprisePropertyId,
    ]) {
      for (const days of [5, 20, 40, 100]) {
        await seedAnalyticsEvent(prisma, {
          propertyId: targetPropertyId,
          type: 'VIEW',
          occurredAt: daysAgo(days),
        });
      }
    }

    // A single view on the second ranking property, so its total (1) is
    // clearly lower than professionalPropertyId's (4, from the loop above)
    // for the ranking-order assertion.
    await seedAnalyticsEvent(prisma, {
      propertyId: professionalPropertyId2,
      type: 'VIEW',
      occurredAt: daysAgo(1),
    });

    // Device breakdown fixtures: 2 MOBILE, 1 DESKTOP, 1 UNKNOWN VIEW events,
    // plus one WHATSAPP_REVEAL (never carries a deviceType) to confirm
    // non-VIEW events are excluded from the breakdown.
    await seedAnalyticsEvent(prisma, {
      propertyId: deviceBreakdownPropertyId,
      type: 'VIEW',
      deviceType: 'MOBILE',
      occurredAt: new Date(),
    });
    await seedAnalyticsEvent(prisma, {
      propertyId: deviceBreakdownPropertyId,
      type: 'VIEW',
      deviceType: 'MOBILE',
      occurredAt: new Date(),
    });
    await seedAnalyticsEvent(prisma, {
      propertyId: deviceBreakdownPropertyId,
      type: 'VIEW',
      deviceType: 'DESKTOP',
      occurredAt: new Date(),
    });
    await seedAnalyticsEvent(prisma, {
      propertyId: deviceBreakdownPropertyId,
      type: 'VIEW',
      deviceType: 'UNKNOWN',
      occurredAt: new Date(),
    });
    await seedAnalyticsEvent(prisma, {
      propertyId: deviceBreakdownPropertyId,
      type: 'WHATSAPP_REVEAL',
      occurredAt: new Date(),
    });
  });

  afterAll(async () => {
    const users = await prisma.user.findMany({
      where: {
        email: {
          in: [
            starterAdminEmail,
            noPlanAdminEmail,
            otherAdminEmail,
            clientEmail,
            professionalAdminEmail,
            businessAdminEmail,
            enterpriseAdminEmail,
            otherProfessionalAdminEmail,
          ],
        },
      },
      select: { id: true },
    });
    const userIds = users.map((u) => u.id);
    await prisma.propertyAnalyticsEvent.deleteMany({
      where: { property: { adminId: { in: userIds } } },
    });
    await prisma.notification.deleteMany({
      where: { recipientUserId: { in: userIds } },
    });
    await prisma.message.deleteMany({
      where: { authorId: { in: userIds } },
    });
    await prisma.conversation.deleteMany({
      where: {
        OR: [{ clientId: { in: userIds } }, { adminId: { in: userIds } }],
      },
    });
    await prisma.property.deleteMany({ where: { adminId: { in: userIds } } });
    await prisma.user.deleteMany({ where: { id: { in: userIds } } });
    // The STARTER Plan row itself is intentionally left in place — seedAdmin
    // upserts it idempotently by tier, and other admins (e.g. seed.ts's
    // demo data) may already reference the same row.
    await app.close();
  });

  it('records a public view event, reflected in the owning STARTER admin summary', async () => {
    await request(app.getHttpServer())
      .post(`/api/analytics/properties/${propertyId}/view`)
      .expect(201);

    const summary = await request(app.getHttpServer())
      .get(`/api/analytics/properties/${propertyId}/summary`)
      .set('Cookie', starterAdminCookie)
      .expect(200);

    expect(summary.body).toMatchObject({
      totalViews: 1,
      totalContacts: 0,
      conversionRate: 0,
    });
  });

  it('records WHATSAPP_REVEAL on contact reveal and MESSAGE_STARTED on conversation start', async () => {
    const publicProperty = await request(app.getHttpServer())
      .get(`/api/properties/${propertyId}`)
      .expect(200);
    const token = (publicProperty.body as { contactRevealToken: string })
      .contactRevealToken;
    expect(token).toBeTruthy();

    await request(app.getHttpServer())
      .post(`/api/properties/${propertyId}/reveal-contact`)
      .send({ token })
      .expect(201);

    await request(app.getHttpServer())
      .post('/api/conversations')
      .set('Cookie', clientCookie)
      .send({ propertyId, content: 'Is this still available?' })
      .expect(201);

    const summary = await request(app.getHttpServer())
      .get(`/api/analytics/properties/${propertyId}/summary`)
      .set('Cookie', starterAdminCookie)
      .expect(200);

    expect(summary.body).toMatchObject({
      totalViews: 1,
      totalContacts: 2,
      conversionRate: 2,
    });
  });

  it('rejects the portfolio summary for an admin with no plan assigned', () => {
    return request(app.getHttpServer())
      .get('/api/analytics/summary')
      .set('Cookie', noPlanAdminCookie)
      .expect(403);
  });

  it('returns the portfolio summary for a STARTER admin', async () => {
    const summary = await request(app.getHttpServer())
      .get('/api/analytics/summary')
      .set('Cookie', starterAdminCookie)
      .expect(200);

    expect(summary.body).toMatchObject({
      totalViews: 1,
      totalContacts: 2,
      conversionRate: 2,
    });
  });

  it("rejects a property summary request for a property the caller doesn't own", () => {
    return request(app.getHttpServer())
      .get(`/api/analytics/properties/${propertyId}/summary`)
      .set('Cookie', otherAdminCookie)
      .expect(403);
  });

  it('daily trend for a PROFESSIONAL admin only includes events from the last 30 days', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/analytics/properties/${professionalPropertyId}/trend`)
      .set('Cookie', professionalAdminCookie)
      .expect(200);

    const points = res.body as {
      day: string;
      viewCount: number;
      contactCount: number;
    }[];
    const totalViews = points.reduce((sum, p) => sum + p.viewCount, 0);
    // day-5 and day-20 fall inside the last 30 days; day-40 and day-100 don't.
    expect(totalViews).toBe(2);
  });

  it('daily trend for a BUSINESS admin includes events from the last 90 days', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/analytics/properties/${businessPropertyId}/trend`)
      .set('Cookie', businessAdminCookie)
      .expect(200);

    const points = res.body as {
      day: string;
      viewCount: number;
      contactCount: number;
    }[];
    const totalViews = points.reduce((sum, p) => sum + p.viewCount, 0);
    // day-5, day-20 and day-40 fall inside the last 90 days; day-100 doesn't.
    expect(totalViews).toBe(3);
  });

  it("daily trend for an ENTERPRISE admin includes the property's full history", async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/analytics/properties/${enterprisePropertyId}/trend`)
      .set('Cookie', enterpriseAdminCookie)
      .expect(200);

    const points = res.body as {
      day: string;
      viewCount: number;
      contactCount: number;
    }[];
    const totalViews = points.reduce((sum, p) => sum + p.viewCount, 0);
    // All 4 fixture events (day-5/20/40/100) are included — no lower bound.
    expect(totalViews).toBe(4);
  });

  it('rejects the trend endpoint for a STARTER admin', () => {
    return request(app.getHttpServer())
      .get(`/api/analytics/properties/${propertyId}/trend`)
      .set('Cookie', starterAdminCookie)
      .expect(403);
  });

  it("rejects the trend endpoint for a property the caller doesn't own", () => {
    return request(app.getHttpServer())
      .get(`/api/analytics/properties/${professionalPropertyId}/trend`)
      .set('Cookie', otherProfessionalAdminCookie)
      .expect(403);
  });

  it('ranks a PROFESSIONAL admin properties by total views, descending', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/analytics/ranking')
      .set('Cookie', professionalAdminCookie)
      .expect(200);

    const entries = res.body as {
      propertyId: string;
      title: string;
      totalViews: number;
      totalContacts: number;
      conversionRate: number;
    }[];

    const topEntry = entries.find(
      (e) => e.propertyId === professionalPropertyId,
    );
    const secondEntry = entries.find(
      (e) => e.propertyId === professionalPropertyId2,
    );
    expect(topEntry).toBeDefined();
    expect(secondEntry).toBeDefined();
    expect(topEntry?.totalViews).toBe(4);
    expect(secondEntry?.totalViews).toBe(1);
    expect(entries.indexOf(topEntry!)).toBeLessThan(
      entries.indexOf(secondEntry!),
    );
  });

  it('rejects the ranking endpoint for a STARTER admin', () => {
    return request(app.getHttpServer())
      .get('/api/analytics/ranking')
      .set('Cookie', starterAdminCookie)
      .expect(403);
  });

  it('separates device-type counts for a property (VIEW events only)', async () => {
    const res = await request(app.getHttpServer())
      .get(
        `/api/analytics/properties/${deviceBreakdownPropertyId}/device-breakdown`,
      )
      .set('Cookie', professionalAdminCookie)
      .expect(200);

    const entries = res.body as { deviceType: string; count: number }[];
    const countsByDevice = Object.fromEntries(
      entries.map((e) => [e.deviceType, e.count]),
    );

    expect(countsByDevice).toEqual({ MOBILE: 2, DESKTOP: 1, UNKNOWN: 1 });
  });

  it('rejects the device breakdown endpoint for a STARTER admin', () => {
    return request(app.getHttpServer())
      .get(`/api/analytics/properties/${propertyId}/device-breakdown`)
      .set('Cookie', starterAdminCookie)
      .expect(403);
  });

  it("rejects the device breakdown endpoint for a property the caller doesn't own", () => {
    return request(app.getHttpServer())
      .get(
        `/api/analytics/properties/${deviceBreakdownPropertyId}/device-breakdown`,
      )
      .set('Cookie', otherProfessionalAdminCookie)
      .expect(403);
  });
});
