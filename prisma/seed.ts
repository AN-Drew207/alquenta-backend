import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);

  const admin1 = await prisma.user.upsert({
    where: { email: 'admin1@example.com' },
    update: {},
    create: {
      id: randomUUID(),
      email: 'admin1@example.com',
      passwordHash,
      name: 'Ada Realty',
      role: 'ADMIN',
    },
  });

  const admin2 = await prisma.user.upsert({
    where: { email: 'admin2@example.com' },
    update: {},
    create: {
      id: randomUUID(),
      email: 'admin2@example.com',
      passwordHash,
      name: 'Bruno Properties',
      role: 'ADMIN',
    },
  });

  const client = await prisma.user.upsert({
    where: { email: 'client1@example.com' },
    update: {},
    create: {
      id: randomUUID(),
      email: 'client1@example.com',
      passwordHash,
      name: 'Test Client',
      role: 'CLIENT',
    },
  });

  const properties = [
    {
      adminId: admin1.id,
      title: 'Modern Downtown Apartment',
      description: 'Bright 2-bedroom apartment in the heart of the city.',
      address: '123 Main St',
      city: 'Cordoba',
      type: 'APARTMENT',
      operationType: 'RENT',
      price: 650,
      bedrooms: 2,
      bathrooms: 1,
      squareMeters: 70,
      images: [] as string[],
    },
    {
      adminId: admin1.id,
      title: 'Cozy Suburban House',
      description: 'Family house with a garden, quiet neighborhood.',
      address: '456 Oak Ave',
      city: 'Cordoba',
      type: 'HOUSE',
      operationType: 'SALE',
      price: 150000,
      bedrooms: 3,
      bathrooms: 2,
      squareMeters: 140,
      images: [] as string[],
    },
    {
      adminId: admin2.id,
      title: 'Office Space Downtown',
      description: 'Open-plan office, ready to move in.',
      address: '789 Business Blvd',
      city: 'Buenos Aires',
      type: 'OFFICE',
      operationType: 'RENT',
      price: 1200,
      bedrooms: null,
      bathrooms: null,
      squareMeters: 90,
      images: [] as string[],
    },
    {
      adminId: admin2.id,
      title: 'Commercial Storefront',
      description: 'High-traffic storefront, corner lot.',
      address: '321 Market St',
      city: 'Buenos Aires',
      type: 'COMMERCIAL_SPACE',
      operationType: 'SALE',
      price: 200000,
      bedrooms: null,
      bathrooms: null,
      squareMeters: 120,
      images: [] as string[],
    },
  ] as const;

  for (const property of properties) {
    const existing = await prisma.property.findFirst({
      where: { title: property.title, adminId: property.adminId },
    });
    if (!existing) {
      await prisma.property.create({
        data: { id: randomUUID(), ...property },
      });
    }
  }

  console.log('Seed complete:', {
    admins: [admin1.email, admin2.email],
    client: client.email,
    properties: properties.length,
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
