import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

function splitName(fullName: string): { firstName: string; lastName: string } {
  const trimmed = fullName.trim();
  const spaceIndex = trimmed.indexOf(' ');
  if (spaceIndex === -1) {
    return { firstName: trimmed, lastName: ' ' };
  }
  return {
    firstName: trimmed.slice(0, spaceIndex),
    lastName: trimmed.slice(spaceIndex + 1),
  };
}

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);

  const plans = [
    { tier: 'STARTER', name: 'Starter', monthlyPriceUsd: 15, activeListingsLimit: 10 },
    { tier: 'PROFESSIONAL', name: 'Profesional', monthlyPriceUsd: 30, activeListingsLimit: 22 },
    { tier: 'BUSINESS', name: 'Business', monthlyPriceUsd: 50, activeListingsLimit: 45 },
    { tier: 'ENTERPRISE', name: 'Enterprise', monthlyPriceUsd: 100, activeListingsLimit: null },
  ] as const;

  const plansByTier: Record<string, { id: string }> = {};
  for (const plan of plans) {
    plansByTier[plan.tier] = await prisma.plan.upsert({
      where: { tier: plan.tier },
      update: {
        name: plan.name,
        monthlyPriceUsd: plan.monthlyPriceUsd,
        activeListingsLimit: plan.activeListingsLimit,
      },
      create: {
        id: randomUUID(),
        tier: plan.tier,
        name: plan.name,
        monthlyPriceUsd: plan.monthlyPriceUsd,
        activeListingsLimit: plan.activeListingsLimit,
      },
    });
  }

  const admin1 = await prisma.user.upsert({
    where: { email: 'admin1@example.com' },
    update: { planId: plansByTier.STARTER.id },
    create: {
      id: randomUUID(),
      email: 'admin1@example.com',
      passwordHash,
      name: 'Ada Realty',
      ...splitName('Ada Realty'),
      role: 'ADMIN',
      planId: plansByTier.STARTER.id,
    },
  });

  const admin2 = await prisma.user.upsert({
    where: { email: 'admin2@example.com' },
    update: { planId: plansByTier.PROFESSIONAL.id },
    create: {
      id: randomUUID(),
      email: 'admin2@example.com',
      passwordHash,
      name: 'Bruno Properties',
      ...splitName('Bruno Properties'),
      role: 'ADMIN',
      planId: plansByTier.PROFESSIONAL.id,
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
      ...splitName('Test Client'),
      role: 'CLIENT',
    },
  });

  const TEST_IMAGES = [
    'https://res.cloudinary.com/xkx2nbq7/image/upload/v1786419415/alquenta/properties/n5shpnlwjtjlbzjwwms3.jpg',
    'https://res.cloudinary.com/xkx2nbq7/image/upload/v1786419423/alquenta/properties/yktku4mf9ecqj9ole2w1.jpg',
    'https://res.cloudinary.com/xkx2nbq7/image/upload/v1786419425/alquenta/properties/g0crrrh9xtv9ftgcfe1c.jpg',
  ];

  const properties = [
    {
      adminId: admin1.id,
      title: 'Modern Downtown Apartment',
      description: 'Bright 2-bedroom apartment in the heart of the city.',
      address: '123 Main St',
      state: 'Distrito Capital',
      municipality: 'Libertador',
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
      state: 'Mérida',
      municipality: 'Libertador',
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
      state: 'Zulia',
      municipality: 'Maracaibo',
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
      state: 'Carabobo',
      municipality: 'Valencia',
      type: 'COMMERCIAL_SPACE',
      operationType: 'SALE',
      price: 200000,
      bedrooms: null,
      bathrooms: null,
      squareMeters: 120,
      images: [] as string[],
    },
    // Below: 3 properties per type, with varied location/price/rooms, reusing
    // the same demo images so the catalog/filters have real data to test against.
    {
      adminId: admin1.id,
      title: 'Family House in Los Salias',
      description: 'Spacious family house with garden, close to schools and shops.',
      address: 'Calle Real de Los Salias',
      state: 'Miranda',
      municipality: 'Los Salias',
      type: 'HOUSE',
      operationType: 'SALE',
      price: 180000,
      bedrooms: 3,
      bathrooms: 2,
      parkingSpaces: 2,
      squareMeters: 180,
      images: TEST_IMAGES,
    },
    {
      adminId: admin2.id,
      title: 'Countryside House in Mérida',
      description: 'Mountain-view house with large plot, ideal for a quiet retreat.',
      address: 'Vía Los Curos',
      state: 'Mérida',
      municipality: 'Campo Elías',
      type: 'HOUSE',
      operationType: 'SALE',
      price: 95000,
      bedrooms: 4,
      bathrooms: 3,
      parkingSpaces: 2,
      squareMeters: 220,
      images: TEST_IMAGES,
    },
    {
      adminId: admin1.id,
      title: 'Modern House in Maracaibo',
      description: 'Recently renovated house in a gated community.',
      address: 'Av. Fuerzas Armadas',
      state: 'Zulia',
      municipality: 'Maracaibo',
      type: 'HOUSE',
      operationType: 'RENT',
      price: 800,
      bedrooms: 3,
      bathrooms: 2,
      parkingSpaces: 1,
      squareMeters: 160,
      images: TEST_IMAGES,
    },
    {
      adminId: admin2.id,
      title: 'Apartment in Chacao',
      description: 'Bright apartment near the metro, walking distance to restaurants.',
      address: 'Av. Francisco de Miranda',
      state: 'Miranda',
      municipality: 'Chacao',
      type: 'APARTMENT',
      operationType: 'RENT',
      price: 950,
      bedrooms: 2,
      bathrooms: 2,
      parkingSpaces: 1,
      squareMeters: 90,
      images: TEST_IMAGES,
    },
    {
      adminId: admin1.id,
      title: 'Beachfront Apartment in Margarita',
      description: 'Ocean-view apartment steps away from the beach.',
      address: 'Av. Bolívar, Pampatar',
      state: 'Nueva Esparta',
      municipality: 'Mariño',
      type: 'APARTMENT',
      operationType: 'SALE',
      price: 65000,
      bedrooms: 2,
      bathrooms: 1,
      parkingSpaces: 1,
      squareMeters: 75,
      images: TEST_IMAGES,
    },
    {
      adminId: admin2.id,
      title: 'Executive Apartment in Valencia',
      description: 'Compact, modern apartment ideal for a single professional.',
      address: 'Av. Bolívar Norte',
      state: 'Carabobo',
      municipality: 'Valencia',
      type: 'APARTMENT',
      operationType: 'RENT',
      price: 600,
      bedrooms: 1,
      bathrooms: 1,
      parkingSpaces: 1,
      squareMeters: 55,
      images: TEST_IMAGES,
    },
    {
      adminId: admin1.id,
      title: 'Storefront in Sabana Grande',
      description: 'High-traffic storefront on a busy pedestrian boulevard.',
      address: 'Bulevar de Sabana Grande',
      state: 'Distrito Capital',
      municipality: 'Libertador',
      type: 'COMMERCIAL_SPACE',
      operationType: 'RENT',
      price: 1200,
      bedrooms: null,
      bathrooms: 1,
      parkingSpaces: 0,
      squareMeters: 100,
      images: TEST_IMAGES,
    },
    {
      adminId: admin2.id,
      title: 'Mall Unit in Barquisimeto',
      description: 'Retail unit inside a well-established shopping mall.',
      address: 'Av. Los Leones',
      state: 'Lara',
      municipality: 'Iribarren',
      type: 'COMMERCIAL_SPACE',
      operationType: 'SALE',
      price: 140000,
      bedrooms: null,
      bathrooms: 2,
      parkingSpaces: 2,
      squareMeters: 200,
      images: TEST_IMAGES,
    },
    {
      adminId: admin1.id,
      title: 'Corner Shop in San Cristóbal',
      description: 'Corner commercial space with excellent visibility.',
      address: 'Carrera 7 con Calle 5',
      state: 'Táchira',
      municipality: 'San Cristóbal',
      type: 'COMMERCIAL_SPACE',
      operationType: 'RENT',
      price: 700,
      bedrooms: null,
      bathrooms: 1,
      parkingSpaces: 1,
      squareMeters: 80,
      images: TEST_IMAGES,
    },
    {
      adminId: admin2.id,
      title: 'Office in Business Tower Caracas',
      description: 'Full-floor office space in a class-A business tower.',
      address: 'Av. Francisco de Miranda, Chacaíto',
      state: 'Distrito Capital',
      municipality: 'Libertador',
      type: 'OFFICE',
      operationType: 'RENT',
      price: 1500,
      bedrooms: null,
      bathrooms: 2,
      parkingSpaces: 3,
      squareMeters: 140,
      images: TEST_IMAGES,
    },
    {
      adminId: admin1.id,
      title: 'Corporate Office in Naguanagua',
      description: 'Standalone office building, ready for a corporate headquarters.',
      address: 'Av. Universidad',
      state: 'Carabobo',
      municipality: 'Naguanagua',
      type: 'OFFICE',
      operationType: 'SALE',
      price: 90000,
      bedrooms: null,
      bathrooms: 1,
      parkingSpaces: 2,
      squareMeters: 110,
      images: TEST_IMAGES,
    },
    {
      adminId: admin2.id,
      title: 'Shared Office in Lechería',
      description: 'Small private office inside a coworking building.',
      address: 'Av. Principal de Lechería',
      state: 'Anzoátegui',
      municipality: 'Urbaneja',
      type: 'OFFICE',
      operationType: 'RENT',
      price: 450,
      bedrooms: null,
      bathrooms: 1,
      parkingSpaces: 1,
      squareMeters: 45,
      images: TEST_IMAGES,
    },
    {
      adminId: admin1.id,
      title: 'Development Land in Guaicaipuro',
      description: 'Flat, buildable lot in a fast-growing area.',
      address: 'Sector Las Minas',
      state: 'Miranda',
      municipality: 'Guaicaipuro',
      type: 'LAND',
      operationType: 'SALE',
      price: 220000,
      bedrooms: null,
      bathrooms: null,
      parkingSpaces: null,
      squareMeters: 5000,
      images: TEST_IMAGES,
    },
    {
      adminId: admin2.id,
      title: 'Farmland in Campo Elías',
      description: 'Fertile farmland with water access, currently in use.',
      address: 'Vía Ejido',
      state: 'Mérida',
      municipality: 'Campo Elías',
      type: 'LAND',
      operationType: 'SALE',
      price: 60000,
      bedrooms: null,
      bathrooms: null,
      parkingSpaces: null,
      squareMeters: 10000,
      images: TEST_IMAGES,
    },
    {
      adminId: admin1.id,
      title: 'Commercial Lot in Cabimas',
      description: 'Corner lot zoned for commercial use, near the main avenue.',
      address: 'Av. Bolívar',
      state: 'Zulia',
      municipality: 'Cabimas',
      type: 'LAND',
      operationType: 'SALE',
      price: 130000,
      bedrooms: null,
      bathrooms: null,
      parkingSpaces: null,
      squareMeters: 3000,
      images: TEST_IMAGES,
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
