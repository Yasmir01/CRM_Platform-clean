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

  // --- PLAN mode seed (optional demo) ---
  await prisma.subscriptionPlan.createMany({
    data: [
      { name: 'Starter', price: 29, billingCycle: 'monthly' },
      { name: 'Pro', price: 99, billingCycle: 'monthly' },
      { name: 'Enterprise', price: 299, billingCycle: 'monthly' },
    ],
    skipDuplicates: true,
  });

  const starterPlan = await prisma.subscriptionPlan.findFirst({ where: { name: 'Starter' } });
  const proPlan = await prisma.subscriptionPlan.findFirst({ where: { name: 'Pro' } });
  const enterprisePlan = await prisma.subscriptionPlan.findFirst({ where: { name: 'Enterprise' } });

  if (starterPlan && proPlan && enterprisePlan) {
    await prisma.featureToggle.createMany({
      data: [
        { planId: starterPlan.id, featureKey: 'Basic Reporting' },
        { planId: proPlan.id, featureKey: 'Advanced Analytics' },
        { planId: enterprisePlan.id, featureKey: 'Custom Integrations' },
      ],
      skipDuplicates: true,
    });
  }

  // Attach org to Pro plan and switch to PLAN mode (demo)
  if (proPlan) {
    await prisma.organizationSubscription.create({
      data: {
        orgId: org.id,
        planId: proPlan.id,
        currentPeriodEnd: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      },
    });
    await prisma.organization.update({ where: { id: org.id }, data: { subscriptionMode: 'PLAN' } });
  }

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
