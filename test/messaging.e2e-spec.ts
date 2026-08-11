import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { createTestApp, extractCookie } from './utils/create-test-app';
import { PrismaService } from '../src/shared/infrastructure/prisma/prisma.service';

describe('Messaging (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let adminCookie: string;
  let clientCookie: string;
  let strangerCookie: string;
  let propertyId: string;

  const adminEmail = 'admin@e2e-messaging.test';
  const clientEmail = 'client@e2e-messaging.test';
  const strangerEmail = 'stranger@e2e-messaging.test';
  const password = 'password123';

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);

    const registerAdmin = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ email: adminEmail, password, name: 'Msg Admin', role: 'ADMIN' });
    adminCookie = extractCookie(registerAdmin.headers['set-cookie']);

    const registerClient = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ email: clientEmail, password, name: 'Msg Client', role: 'CLIENT' });
    clientCookie = extractCookie(registerClient.headers['set-cookie']);

    const registerStranger = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ email: strangerEmail, password, name: 'Stranger', role: 'CLIENT' });
    strangerCookie = extractCookie(registerStranger.headers['set-cookie']);

    const property = await request(app.getHttpServer())
      .post('/api/properties')
      .set('Cookie', adminCookie)
      .send({
        title: 'E2E Messaging Property',
        description: 'desc',
        address: 'addr',
        state: 'Miranda',
        municipality: 'Baruta',
        type: 'HOUSE',
        operationType: 'SALE',
        price: 100000,
      });
    propertyId = property.body.id;
  });

  afterAll(async () => {
    const users = await prisma.user.findMany({
      where: { email: { in: [adminEmail, clientEmail, strangerEmail] } },
      select: { id: true },
    });
    const userIds = users.map((u) => u.id);
    await prisma.notification.deleteMany({
      where: { recipientUserId: { in: userIds } },
    });
    await prisma.message.deleteMany({
      where: { authorId: { in: userIds } },
    });
    await prisma.conversation.deleteMany({
      where: { OR: [{ clientId: { in: userIds } }, { adminId: { in: userIds } }] },
    });
    await prisma.property.deleteMany({ where: { adminId: { in: userIds } } });
    await prisma.user.deleteMany({ where: { id: { in: userIds } } });
    await app.close();
  });

  it('lets a CLIENT contact an available property', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/conversations')
      .set('Cookie', clientCookie)
      .send({ propertyId, content: 'Is this available?' })
      .expect(201);

    expect(res.body.conversation.propertyId).toBe(propertyId);
    expect(res.body.message.content).toBe('Is this available?');
  });

  it('rejects an ADMIN starting a conversation (CLIENT only)', () => {
    return request(app.getHttpServer())
      .post('/api/conversations')
      .set('Cookie', adminCookie)
      .send({ propertyId, content: 'hi' })
      .expect(403);
  });

  it('reuses the same conversation on a second contact from the same client', async () => {
    const first = await request(app.getHttpServer())
      .post('/api/conversations')
      .set('Cookie', clientCookie)
      .send({ propertyId, content: 'first' })
      .expect(201);

    const second = await request(app.getHttpServer())
      .post('/api/conversations')
      .set('Cookie', clientCookie)
      .send({ propertyId, content: 'second' })
      .expect(201);

    expect(second.body.conversation.id).toBe(first.body.conversation.id);
  });

  it('converges to a single conversation under concurrent contact requests', async () => {
    const [resA, resB] = await Promise.all([
      request(app.getHttpServer())
        .post('/api/conversations')
        .set('Cookie', clientCookie)
        .send({ propertyId, content: 'race A' }),
      request(app.getHttpServer())
        .post('/api/conversations')
        .set('Cookie', clientCookie)
        .send({ propertyId, content: 'race B' }),
    ]);

    expect(resA.status).toBe(201);
    expect(resB.status).toBe(201);
    expect(resA.body.conversation.id).toBe(resB.body.conversation.id);
    expect(resA.body.message.id).not.toBe(resB.body.message.id);
  });

  it("rejects a non-participant from reading the conversation's messages", async () => {
    const conv = await prisma.conversation.findFirstOrThrow({
      where: { propertyId },
    });

    return request(app.getHttpServer())
      .get(`/api/conversations/${conv.id}/messages`)
      .set('Cookie', strangerCookie)
      .expect(403);
  });

  it('lets the admin reply, and the client sees it', async () => {
    const conv = await prisma.conversation.findFirstOrThrow({
      where: { propertyId },
    });

    await request(app.getHttpServer())
      .post(`/api/conversations/${conv.id}/messages`)
      .set('Cookie', adminCookie)
      .send({ content: 'Sure, still available' })
      .expect(201);

    const messages = await request(app.getHttpServer())
      .get(`/api/conversations/${conv.id}/messages`)
      .set('Cookie', clientCookie)
      .expect(200);

    expect(
      messages.body.some((m: { content: string }) => m.content === 'Sure, still available'),
    ).toBe(true);
  });

  it('rejects starting a new conversation on a non-available property', async () => {
    await request(app.getHttpServer())
      .patch(`/api/properties/${propertyId}`)
      .set('Cookie', adminCookie)
      .send({ status: 'CANCELLED' })
      .expect(200);

    return request(app.getHttpServer())
      .post('/api/conversations')
      .set('Cookie', strangerCookie)
      .send({ propertyId, content: 'hello' })
      .expect(422);
  });
});
