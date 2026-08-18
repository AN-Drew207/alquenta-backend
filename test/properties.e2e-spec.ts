import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import {
  createTestApp,
  loginAndExtractCookie,
  seedAdmin,
} from './utils/create-test-app';
import { PrismaService } from '../src/shared/infrastructure/prisma/prisma.service';

describe('Properties (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let adminACookie: string;
  let adminBCookie: string;
  let propertyId: string;

  const adminAEmail = 'admin-a@e2e-properties.test';
  const adminBEmail = 'admin-b@e2e-properties.test';
  const password = 'password123';

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);

    await seedAdmin(prisma, { email: adminAEmail, password, name: 'Admin A' });
    adminACookie = await loginAndExtractCookie(app, adminAEmail, password);

    await seedAdmin(prisma, { email: adminBEmail, password, name: 'Admin B' });
    adminBCookie = await loginAndExtractCookie(app, adminBEmail, password);
  });

  afterAll(async () => {
    await prisma.property.deleteMany({
      where: { admin: { email: { in: [adminAEmail, adminBEmail] } } },
    });
    await prisma.user.deleteMany({
      where: { email: { in: [adminAEmail, adminBEmail] } },
    });
    await app.close();
  });

  it('rejects publishing without authentication', () => {
    return request(app.getHttpServer())
      .post('/api/properties')
      .send({ title: 'x' })
      .expect(401);
  });

  it('lets an ADMIN publish a property', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/properties')
      .set('Cookie', adminACookie)
      .send({
        title: 'E2E Test Apartment',
        description: 'desc',
        address: 'addr',
        state: 'Miranda',
        municipality: 'Baruta',
        type: 'APARTMENT',
        operationType: 'RENT',
        price: 500,
        images: ['https://example.com/photo.jpg'],
      })
      .expect(201);

    expect(res.body).toMatchObject({
      title: 'E2E Test Apartment',
      status: 'AVAILABLE',
    });
    propertyId = res.body.id;
  });

  it('shows the property in the public catalog without auth', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/properties')
      .expect(200);

    expect(res.body.some((p: { id: string }) => p.id === propertyId)).toBe(
      true,
    );
  });

  it('returns the property by id without auth', () => {
    return request(app.getHttpServer())
      .get(`/api/properties/${propertyId}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.id).toBe(propertyId);
      });
  });

  it("rejects updating another admin's property with 403", () => {
    return request(app.getHttpServer())
      .patch(`/api/properties/${propertyId}`)
      .set('Cookie', adminBCookie)
      .send({ price: 999 })
      .expect(403);
  });

  it('lets the owning admin update their property', () => {
    return request(app.getHttpServer())
      .patch(`/api/properties/${propertyId}`)
      .set('Cookie', adminACookie)
      .send({ price: 600 })
      .expect(200)
      .expect((res) => {
        expect(res.body.price).toBe(600);
      });
  });

  it('requires the property to be cancelled before deleting it', async () => {
    await request(app.getHttpServer())
      .patch(`/api/properties/${propertyId}`)
      .set('Cookie', adminACookie)
      .send({ status: 'CANCELLED' })
      .expect(200)
      .expect((res) => {
        expect(res.body.status).toBe('CANCELLED');
      });
  });

  it('lets the owning admin delete their cancelled property', () => {
    return request(app.getHttpServer())
      .delete(`/api/properties/${propertyId}`)
      .set('Cookie', adminACookie)
      .expect(204);
  });

  it('returns 404 for the deleted property', () => {
    return request(app.getHttpServer())
      .get(`/api/properties/${propertyId}`)
      .expect(404);
  });

  it('permanently locks a property once marked as rented/sold', async () => {
    const publish = await request(app.getHttpServer())
      .post('/api/properties')
      .set('Cookie', adminACookie)
      .send({
        title: 'E2E Finalized Property',
        description: 'desc',
        address: 'addr',
        state: 'Miranda',
        municipality: 'Baruta',
        type: 'APARTMENT',
        operationType: 'RENT',
        price: 500,
        images: ['https://example.com/photo.jpg'],
      })
      .expect(201);
    const finalizedPropertyId = publish.body.id;

    await request(app.getHttpServer())
      .patch(`/api/properties/${finalizedPropertyId}`)
      .set('Cookie', adminACookie)
      .send({ status: 'RENTED_OR_SOLD' })
      .expect(200)
      .expect((res) => {
        expect(res.body.status).toBe('RENTED_OR_SOLD');
      });

    await request(app.getHttpServer())
      .patch(`/api/properties/${finalizedPropertyId}`)
      .set('Cookie', adminACookie)
      .send({ price: 700 })
      .expect(422);

    await request(app.getHttpServer())
      .patch(`/api/properties/${finalizedPropertyId}`)
      .set('Cookie', adminACookie)
      .send({ status: 'CANCELLED' })
      .expect(422);
  });
});
