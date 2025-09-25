// prisma/seed.ts
import { PrismaClient, Role, Tier } from '@prisma/client';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function main() {
  console.log('🌱 Seeding database...');

  // --- Clean DB (optional reset) ---
  await prisma.deal.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.tenant.deleteMany();
  await prisma.property.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.company.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  // --- Organizations ---
  const org = await prisma.organization.create({
    data: {
      name: faker.company.name(),
      logoUrl: faker.image.url(),
      tier: Tier.BASIC,
    },
  });

  // --- Users ---
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: 'Super Admin',
      password: await bcrypt.hash('SuperAdmin123!', 10), // secure hash
      role: Role.SUPERADMIN,
      orgId: org.id,
    },
  });

  const normalUser = await prisma.user.create({
    data: {
      email: faker.internet.email(),
      name: faker.person.fullName(),
      password: await bcrypt.hash('User123!', 10),
      role: Role.USER,
      orgId: org.id,
    },
  });

  // --- Company & Contact ---
  const company = await prisma.company.create({
    data: {
      name: faker.company.name(),
      industry: faker.company.buzzPhrase(),
      orgId: org.id,
    },
  });

  const contact = await prisma.contact.create({
    data: {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      companyId: company.id,
      orgId: org.id,
    },
  });

  // --- Property & Tenant ---
  const property = await prisma.property.create({
    data: {
      name: faker.company.name() + ' Plaza',
      address: faker.location.streetAddress(),
      orgId: org.id,
    },
  });

  const tenant = await prisma.tenant.create({
    data: {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      propertyId: property.id,
    },
  });

  // --- Deal ---
  await prisma.deal.create({
    data: {
      title: 'Painting Contract',
      description: faker.lorem.sentence(),
      amount: 5000,
      stage: 'Lead',
      probability: 60,
      orgId: org.id,
      companyId: company.id,
      contactId: contact.id,
    },
  });

  // --- Subscription ---
  await prisma.subscription.create({
    data: {
      orgId: org.id,
      plan: Tier.BASIC,
      active: true,
    },
  });

  console.log('✅ Database seeded successfully');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
