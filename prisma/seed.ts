// prisma/seed.ts
import { PrismaClient, Role, Tier } from '@prisma/client';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function main() {
  console.log('🌱 Seeding database...');

<<<<<<< HEAD
  // --- Clean DB ---
  await prisma.deal.deleteMany();
  await prisma.organizationSubscription.deleteMany();
  await prisma.subscriptionPlan.deleteMany();
=======
  // --- Clean DB (optional reset) ---
  await prisma.deal.deleteMany();
  await prisma.subscription.deleteMany();
>>>>>>> ac4b396533b24013bc1866988c2033005cd609c9
  await prisma.tenant.deleteMany();
  await prisma.property.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.company.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();
<<<<<<< HEAD
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
=======

  // --- Organizations ---
>>>>>>> ac4b396533b24013bc1866988c2033005cd609c9
  const org = await prisma.organization.create({
    data: {
      name: faker.company.name(),
      logoUrl: faker.image.url(),
<<<<<<< HEAD
      tier: Tier.BASIC, // keep legacy Tier for now
=======
      tier: Tier.BASIC,
>>>>>>> ac4b396533b24013bc1866988c2033005cd609c9
    },
  });

  // --- Users ---
<<<<<<< HEAD
  await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: 'Super Admin',
      password: await bcrypt.hash('SuperAdmin123!', 10),
=======
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: 'Super Admin',
      password: await bcrypt.hash('SuperAdmin123!', 10), // secure hash
>>>>>>> ac4b396533b24013bc1866988c2033005cd609c9
      role: Role.SUPERADMIN,
      orgId: org.id,
    },
  });

<<<<<<< HEAD
  await prisma.user.create({
=======
  const normalUser = await prisma.user.create({
>>>>>>> ac4b396533b24013bc1866988c2033005cd609c9
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

<<<<<<< HEAD
  await prisma.tenant.create({
=======
  const tenant = await prisma.tenant.create({
>>>>>>> ac4b396533b24013bc1866988c2033005cd609c9
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

<<<<<<< HEAD
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
=======
  // --- Subscription ---
  await prisma.subscription.create({
    data: {
      orgId: org.id,
      plan: Tier.BASIC,
      active: true,
    },
  });
>>>>>>> ac4b396533b24013bc1866988c2033005cd609c9

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
