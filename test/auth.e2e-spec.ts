import { randomUUID } from 'node:crypto';
import { INestApplication } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
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

    // Admins are onboarded manually (no public registration path), so this
    // simulates that manual step directly against the database.
    await prisma.user.create({
      data: {
        id: randomUUID(),
        email: adminEmail,
        passwordHash: await bcrypt.hash(password, 10),
        name: 'E2E Admin',
        firstName: 'E2E',
        lastName: 'Admin',
        role: 'ADMIN',
      },
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { email: { in: [adminEmail, clientEmail] } },
    });
    await app.close();
  });

  it('registers a CLIENT', () => {
    return request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ email: clientEmail, password, name: 'E2E Client' })
      .expect(201)
      .expect((res) => {
        const body = res.body as { passwordHash?: string };
        expect(res.body).toMatchObject({ email: clientEmail, role: 'CLIENT' });
        expect(body.passwordHash).toBeUndefined();
      });
  });

  it('rejects registering with a role in the payload (no public ADMIN sign-up)', () => {
    return request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: 'unused@e2e-auth.test',
        password,
        name: 'Nope',
        role: 'ADMIN',
      })
      .expect(400);
  });

  it('rejects registering the same email twice', () => {
    return request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ email: clientEmail, password, name: 'Dup' })
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
