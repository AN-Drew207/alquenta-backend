import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { createTestApp } from './utils/create-test-app';
import { PrismaService } from '../src/shared/infrastructure/prisma/prisma.service';

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  const adminEmail = 'admin@e2e-auth.test';
  const clientEmail = 'client@e2e-auth.test';
  const password = 'password123';

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { email: { in: [adminEmail, clientEmail] } },
    });
    await app.close();
  });

  it('registers an ADMIN', () => {
    return request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ email: adminEmail, password, name: 'E2E Admin', role: 'ADMIN' })
      .expect(201)
      .expect((res) => {
        expect(res.body).toMatchObject({ email: adminEmail, role: 'ADMIN' });
        expect(res.body.passwordHash).toBeUndefined();
      });
  });

  it('registers a CLIENT', () => {
    return request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ email: clientEmail, password, name: 'E2E Client', role: 'CLIENT' })
      .expect(201)
      .expect((res) => {
        expect(res.body).toMatchObject({ email: clientEmail, role: 'CLIENT' });
      });
  });

  it('rejects registering the same email twice', () => {
    return request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ email: adminEmail, password, name: 'Dup', role: 'ADMIN' })
      .expect(409);
  });

  it('rejects login with the wrong password', () => {
    return request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: adminEmail, password: 'wrong-password' })
      .expect(401);
  });

  it('logs in with correct credentials and sets the session cookie', () => {
    return request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: adminEmail, password })
      .expect(200)
      .expect((res) => {
        expect(res.headers['set-cookie']).toBeDefined();
        expect(res.body).toMatchObject({ email: adminEmail, role: 'ADMIN' });
      });
  });

  it('rejects /auth/me without a session cookie', () => {
    return request(app.getHttpServer()).get('/api/auth/me').expect(401);
  });

  it('returns the authenticated user on /auth/me with a valid cookie', async () => {
    const loginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: adminEmail, password })
      .expect(200);

    const cookie = loginRes.headers['set-cookie'];

    await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Cookie', cookie)
      .expect(200)
      .expect((res) => {
        expect(res.body).toMatchObject({ email: adminEmail, role: 'ADMIN' });
      });
  });
});
