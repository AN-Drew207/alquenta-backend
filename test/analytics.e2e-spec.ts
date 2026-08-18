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

describe('Analytics (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let starterAdminCookie: string;
  let noPlanAdminCookie: string;
  let otherAdminCookie: string;
  let clientCookie: string;
  let propertyId: string;

  const starterAdminEmail = 'starter-admin@e2e-analytics.test';
  const noPlanAdminEmail = 'no-plan-admin@e2e-analytics.test';
  const otherAdminEmail = 'other-admin@e2e-analytics.test';
  const clientEmail = 'client@e2e-analytics.test';
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
});
