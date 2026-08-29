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
import { CheckNoContactsAlertsUseCase } from '../src/modules/analytics/application/use-cases/check-no-contacts-alerts/check-no-contacts-alerts.use-case';

/**
 * Creates a minimal property owned by the given (already-cookied) admin.
 * `state` defaults to 'Miranda' (every pre-existing fixture in this file
 * uses it) — Fase 3's benchmark fixtures pass a different state ('Zulia')
 * to build an isolated comparable-listing pool that doesn't pick up every
 * other property in this suite.
 */
async function createAnalyticsProperty(
  app: INestApplication<App>,
  cookie: string,
  title: string,
  state = 'Miranda',
): Promise<string> {
  const res = await request(app.getHttpServer())
    .post('/api/properties')
    .set('Cookie', cookie)
    .send({
      title,
      description: 'desc',
      address: 'addr',
      state,
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

  // Fase 3 fixtures
  let benchmarkPropertyId: string;
  const benchmarkComparableIds: string[] = [];
  let alertNoContactsPropertyId: string;
  let alertWithContactPropertyId: string;

  // Fase 4 fixtures
  let enterpriseHousePropertyId: string;

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

    // --- Fase 3 fixtures ---
    // Benchmark subject property, owned by the BUSINESS admin, in a state
    // ('Zulia') no other fixture in this file uses — keeps its comparable
    // pool isolated from every Miranda-based property above.
    benchmarkPropertyId = await createAnalyticsProperty(
      app,
      businessAdminCookie,
      'Benchmark Subject Property',
      'Zulia',
    );
    // 3 initial comparables (same state/type/operationType, AVAILABLE,
    // different admins) — used by the "unavailable below 5" test. None of
    // these admins is starterAdminCookie: that one's portfolio summary is
    // asserted with exact totals elsewhere in this file, and these
    // comparables get their own analytics events below, which would
    // otherwise silently inflate that unrelated assertion.
    for (const [index, cookie] of [
      otherAdminCookie,
      noPlanAdminCookie,
      otherProfessionalAdminCookie,
    ].entries()) {
      const comparableId = await createAnalyticsProperty(
        app,
        cookie,
        `Benchmark Comparable ${index + 1}`,
        'Zulia',
      );
      benchmarkComparableIds.push(comparableId);
    }
    await seedAnalyticsEvent(prisma, {
      propertyId: benchmarkPropertyId,
      type: 'VIEW',
      occurredAt: new Date(),
    });
    await seedAnalyticsEvent(prisma, {
      propertyId: benchmarkComparableIds[0],
      type: 'VIEW',
      occurredAt: new Date(),
    });
    await seedAnalyticsEvent(prisma, {
      propertyId: benchmarkComparableIds[0],
      type: 'WHATSAPP_REVEAL',
      occurredAt: new Date(),
    });

    // No-contacts alert fixtures, both owned by the BUSINESS admin.
    alertNoContactsPropertyId = await createAnalyticsProperty(
      app,
      businessAdminCookie,
      'Alert No Contacts Property',
    );
    alertWithContactPropertyId = await createAnalyticsProperty(
      app,
      businessAdminCookie,
      'Alert With Contact Property',
    );
    await seedAnalyticsEvent(prisma, {
      propertyId: alertWithContactPropertyId,
      type: 'WHATSAPP_REVEAL',
      occurredAt: new Date(),
    });

    // --- Fase 4 fixtures ---
    // A second ENTERPRISE-owned property of a different type (HOUSE, vs
    // enterprisePropertyId's APARTMENT) — the type-filter tests below
    // prove the aggregate narrows to matching properties only. Its own
    // events are never touched again outside this block, so they can't
    // regress enterprisePropertyId's full-history trend assertion above.
    const enterpriseHouseRes = await request(app.getHttpServer())
      .post('/api/properties')
      .set('Cookie', enterpriseAdminCookie)
      .send({
        title: 'Enterprise Filter House Property',
        description: 'desc',
        address: 'addr',
        state: 'Miranda',
        municipality: 'Baruta',
        type: 'HOUSE',
        operationType: 'RENT',
        price: 500,
        images: ['https://example.com/photo.jpg'],
        whatsapp: '+58 412 1234567',
      });
    enterpriseHousePropertyId = (enterpriseHouseRes.body as { id: string }).id;

    // Fixed-timestamp events for the date-range filter tests: one VIEW +
    // one WHATSAPP_REVEAL inside the last 10 days, one VIEW well outside it.
    await seedAnalyticsEvent(prisma, {
      propertyId: enterpriseHousePropertyId,
      type: 'VIEW',
      occurredAt: daysAgo(3),
    });
    await seedAnalyticsEvent(prisma, {
      propertyId: enterpriseHousePropertyId,
      type: 'WHATSAPP_REVEAL',
      occurredAt: daysAgo(3),
    });
    await seedAnalyticsEvent(prisma, {
      propertyId: enterpriseHousePropertyId,
      type: 'VIEW',
      occurredAt: daysAgo(50),
    });
    // Fase 3 added several more sequential property-creation round trips to
    // this hook (on top of Fase 1/2's), which occasionally pushes it past
    // the default 20s test/hook timeout against real Neon — bump this
    // specific hook rather than the shared jest-e2e.json config. Fase 4
    // added one more property + three more direct event inserts, which
    // pushed the previous 40s budget too close for comfort — bumped again.
  }, 60_000);

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

  it('rejects a portfolio summary filter (type) for a STARTER admin', () => {
    return request(app.getHttpServer())
      .get('/api/analytics/summary')
      .query({ type: 'APARTMENT' })
      .set('Cookie', starterAdminCookie)
      .expect(403);
  });

  it('rejects a portfolio summary filter (type) for a PROFESSIONAL admin', () => {
    return request(app.getHttpServer())
      .get('/api/analytics/summary')
      .query({ type: 'APARTMENT' })
      .set('Cookie', professionalAdminCookie)
      .expect(403);
  });

  it('rejects a portfolio summary filter (type) for a BUSINESS admin', () => {
    return request(app.getHttpServer())
      .get('/api/analytics/summary')
      .query({ type: 'APARTMENT' })
      .set('Cookie', businessAdminCookie)
      .expect(403);
  });

  it('portfolio summary type filter for an ENTERPRISE admin with mixed property types only reflects matching properties', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/analytics/summary')
      .query({ type: 'APARTMENT' })
      .set('Cookie', enterpriseAdminCookie)
      .expect(200);

    // enterprisePropertyId (APARTMENT) has 4 VIEW events (day-5/20/40/100,
    // the same full-history fixture the trend test above asserts on);
    // enterpriseHousePropertyId (HOUSE) is excluded by the type filter even
    // though it has its own events.
    expect(res.body).toMatchObject({
      totalViews: 4,
      totalContacts: 0,
      conversionRate: 0,
    });
  });

  it('portfolio summary date-range filter for an ENTERPRISE admin only counts in-range events', async () => {
    const from = daysAgo(10).toISOString();
    const res = await request(app.getHttpServer())
      .get('/api/analytics/summary')
      .query({ from })
      .set('Cookie', enterpriseAdminCookie)
      .expect(200);

    // Within the last 10 days: enterprisePropertyId's day-5 VIEW, plus
    // enterpriseHousePropertyId's day-3 VIEW and day-3 WHATSAPP_REVEAL.
    // Excluded: day-20/40/100 (enterprisePropertyId) and day-50
    // (enterpriseHousePropertyId).
    expect(res.body).toMatchObject({
      totalViews: 2,
      totalContacts: 1,
      conversionRate: 0.5,
    });
  });

  it('portfolio summary combines a property-level filter and a date-range filter', async () => {
    const from = daysAgo(10).toISOString();
    const res = await request(app.getHttpServer())
      .get('/api/analytics/summary')
      .query({ type: 'HOUSE', from })
      .set('Cookie', enterpriseAdminCookie)
      .expect(200);

    // Only enterpriseHousePropertyId matches type=HOUSE, and only its
    // day-3 events fall within the last 10 days (day-50 excluded).
    expect(res.body).toMatchObject({
      totalViews: 1,
      totalContacts: 1,
      conversionRate: 1,
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

  it('benchmark is unavailable with fewer than 5 comparable properties', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/analytics/properties/${benchmarkPropertyId}/benchmark`)
      .set('Cookie', businessAdminCookie)
      .expect(200);

    expect(res.body).toEqual({ available: false });
  });

  it("benchmark becomes available at 5 comparable properties, excluding the caller's own properties, non-AVAILABLE listings, and listings of a different type", async () => {
    // 2 more comparables bring the pool to 5.
    for (const [index, cookie] of [
      professionalAdminCookie,
      enterpriseAdminCookie,
    ].entries()) {
      const comparableId = await createAnalyticsProperty(
        app,
        cookie,
        `Benchmark Comparable Extra ${index + 1}`,
        'Zulia',
      );
      benchmarkComparableIds.push(comparableId);
    }

    // A second property of the caller's own in the same bucket must NOT
    // count as a comparable.
    await createAnalyticsProperty(
      app,
      businessAdminCookie,
      'Benchmark Own Second Property',
      'Zulia',
    );

    // A different-type listing in the same state/operationType must NOT
    // count either.
    await request(app.getHttpServer())
      .post('/api/properties')
      .set('Cookie', enterpriseAdminCookie)
      .send({
        title: 'Benchmark Different Type Property',
        description: 'desc',
        address: 'addr',
        state: 'Zulia',
        municipality: 'Baruta',
        type: 'HOUSE',
        operationType: 'RENT',
        price: 500,
        images: ['https://example.com/photo.jpg'],
      });

    // A cancelled (non-AVAILABLE) listing in the same bucket must NOT
    // count either.
    const cancelledRes = await request(app.getHttpServer())
      .post('/api/properties')
      .set('Cookie', enterpriseAdminCookie)
      .send({
        title: 'Benchmark Cancelled Property',
        description: 'desc',
        address: 'addr',
        state: 'Zulia',
        municipality: 'Baruta',
        type: 'APARTMENT',
        operationType: 'RENT',
        price: 500,
        images: ['https://example.com/photo.jpg'],
      });
    const cancelledPropertyId = (cancelledRes.body as { id: string }).id;
    await request(app.getHttpServer())
      .patch(`/api/properties/${cancelledPropertyId}`)
      .set('Cookie', enterpriseAdminCookie)
      .send({ status: 'CANCELLED' })
      .expect(200);

    const res = await request(app.getHttpServer())
      .get(`/api/analytics/properties/${benchmarkPropertyId}/benchmark`)
      .set('Cookie', businessAdminCookie)
      .expect(200);

    expect(res.body).toMatchObject({
      available: true,
      comparableCount: 5,
      propertyViews: 1,
      propertyContacts: 0,
    });
    const body = res.body as { avgViews: number; avgContacts: number };
    // Only benchmarkComparableIds[0] has any events: 1 VIEW + 1
    // WHATSAPP_REVEAL, spread across 5 comparables.
    expect(body.avgViews).toBeCloseTo(1 / 5);
    expect(body.avgContacts).toBeCloseTo(1 / 5);
  });

  it('rejects the benchmark endpoint for a PROFESSIONAL admin (BUSINESS+ only)', () => {
    return request(app.getHttpServer())
      .get(`/api/analytics/properties/${professionalPropertyId}/benchmark`)
      .set('Cookie', professionalAdminCookie)
      .expect(403);
  });

  it('exports property analytics as CSV', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/analytics/properties/${benchmarkPropertyId}/export`)
      .query({ format: 'csv' })
      .set('Cookie', businessAdminCookie)
      .expect(200);

    expect(res.headers['content-type']).toContain('text/csv');
    expect(res.headers['content-disposition']).toContain('attachment');
    expect(res.text.length).toBeGreaterThan(0);
    expect(res.text).toContain('Benchmark Subject Property');
  });

  it('exports property analytics as PDF', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/analytics/properties/${benchmarkPropertyId}/export`)
      .query({ format: 'pdf' })
      .set('Cookie', businessAdminCookie)
      .expect(200);

    expect(res.headers['content-type']).toContain('application/pdf');
    expect(res.headers['content-disposition']).toContain('attachment');
  });

  it('rejects the export endpoint for an invalid format', () => {
    return request(app.getHttpServer())
      .get(`/api/analytics/properties/${benchmarkPropertyId}/export`)
      .query({ format: 'xml' })
      .set('Cookie', businessAdminCookie)
      .expect(400);
  });

  it('rejects the export endpoint for a PROFESSIONAL admin (BUSINESS+ only)', () => {
    return request(app.getHttpServer())
      .get(`/api/analytics/properties/${professionalPropertyId}/export`)
      .query({ format: 'csv' })
      .set('Cookie', professionalAdminCookie)
      .expect(403);
  });

  it(
    'creates a no-contacts alert for a BUSINESS+ property with zero recent ' +
      'contacts, dedups on an immediate re-run, and skips a property with a ' +
      'recent contact event',
    async () => {
      const checkNoContactsAlertsUseCase = app.get(
        CheckNoContactsAlertsUseCase,
      );

      const firstRunCount = await checkNoContactsAlertsUseCase.execute();
      expect(firstRunCount).toBeGreaterThan(0);

      const noContactsAlertCount = await prisma.notification.count({
        where: {
          propertyId: alertNoContactsPropertyId,
          type: 'ANALYTICS_ALERT',
        },
      });
      expect(noContactsAlertCount).toBe(1);

      const withContactAlertCount = await prisma.notification.count({
        where: {
          propertyId: alertWithContactPropertyId,
          type: 'ANALYTICS_ALERT',
        },
      });
      expect(withContactAlertCount).toBe(0);

      // Immediate re-run: every eligible property already has a
      // notification within the 14-day dedup window, so nothing new
      // should be created.
      const secondRunCount = await checkNoContactsAlertsUseCase.execute();
      expect(secondRunCount).toBe(0);

      const noContactsAlertCountAfterSecondRun =
        await prisma.notification.count({
          where: {
            propertyId: alertNoContactsPropertyId,
            type: 'ANALYTICS_ALERT',
          },
        });
      expect(noContactsAlertCountAfterSecondRun).toBe(1);
    },
    // Scans every AVAILABLE property in the DB with a BUSINESS+ admin
    // (several by this point in the suite) and best-effort emails each new
    // alert (each a real, slow Resend round trip that's expected to fail
    // in this sandbox and get swallowed) — past the default 20s test
    // timeout often enough to warrant a bump, same reasoning as the
    // beforeAll hook above.
    40_000,
  );
});
