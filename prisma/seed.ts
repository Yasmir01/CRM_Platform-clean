// prisma/seed.ts
import { PrismaClient, Role, Tier } from '@prisma/client';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function main() {
  console.log('🌱 Seeding database...');

  // --- Clean DB ---
  await prisma.deal.deleteMany();
  await prisma.organizationSubscription.deleteMany();
  await prisma.subscriptionPlan.deleteMany();
  await prisma.tenant.deleteMany();
  await prisma.property.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.company.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.featureToggle.deleteMany();

  // --- Subscription Plans ---
  await prisma.subscriptionPlan.createMany({
    data: [
      {
        name: "Starter",
        description: "Essential tools for small landlords and managers",
        priceId: "price_starter_001",
        currency: "usd",
        interval: "month",
        features: ["basic_reporting", "email_support"],
      },
      {
        name: "Pro",
        description: "Advanced features for growing property managers",
        priceId: "price_pro_001",
        currency: "usd",
        interval: "month",
        features: ["advanced_reporting", "priority_support", "multi_property"],
      },
      {
        name: "Enterprise",
        description: "Full suite with premium support and integrations",
        priceId: "price_enterprise_001",
        currency: "usd",
        interval: "month",
        features: ["unlimited_properties", "dedicated_manager", "custom_integrations"],
      },
    ],
    skipDuplicates: true,
  });

  const starterPlan = await prisma.subscriptionPlan.findFirst({
    where: { name: "Starter" },
  });

  // --- Organization ---
  const org = await prisma.organization.create({
    data: {
      name: faker.company.name(),
      logoUrl: faker.image.url(),
      tier: Tier.BASIC, // keep legacy Tier for now
    },
  });

  // --- Users ---
  await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: 'Super Admin',
      password: await bcrypt.hash('SuperAdmin123!', 10),
      role: Role.SUPERADMIN,
      orgId: org.id,
    },
  });

  await prisma.user.create({
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

  await prisma.tenant.create({
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

  // --- Org Subscription ---
  if (starterPlan) {
    await prisma.organizationSubscription.create({
      data: {
        orgId: org.id,
        planId: starterPlan.id,
        status: "active",
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      },
    });
  }

  // --- Feature Toggles ---
 await prisma.featureToggle.createMany({
  data: [
    { orgId: org.id, featureKey: "autopay_enabled", enabled: true },
    { orgId: org.id, featureKey: "multi_language", enabled: false },
  ],
  skipDuplicates: true,
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
