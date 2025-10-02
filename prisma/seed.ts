import { PrismaClient, Role, Tier } from '@prisma/client';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function main() {
  console.log('🌱 Seeding database...');

  // --- Clean DB (order matters for FKs) ---
  await prisma.organizationSubscription.deleteMany();
  await prisma.featureToggle.deleteMany();
  await prisma.subscriptionPlan.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.deal.deleteMany();
  await prisma.tenant.deleteMany();
  await prisma.property.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.company.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  // --- Create Organization (legacy Tier mode by default) ---
  const org = await prisma.organization.create({
    data: {
      name: faker.company.name(),
      logoUrl: faker.image.url(),
      tier: Tier.BASIC,
    },
  });

  // --- Create Users ---
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

  // --- Legacy Subscription (TIER mode example) ---
  await prisma.subscription.create({
    data: {
      orgId: org.id,
      plan: Tier.BASIC,
      active: true,
    },
  });

  // --- PLAN mode: create plans with features ---
  const starter = await prisma.subscriptionPlan.create({
    data: { name: 'Starter', price: 0, billingCycle: 'monthly' },
  });
  const pro = await prisma.subscriptionPlan.create({
    data: { name: 'Pro', price: 49, billingCycle: 'monthly' },
  });
  const enterprise = await prisma.subscriptionPlan.create({
    data: { name: 'Enterprise', price: 199, billingCycle: 'monthly' },
  });

  await prisma.featureToggle.createMany({
    data: [
      // Starter features
      { planId: starter.id, featureKey: 'Basic CRM', enabled: true },
      { planId: starter.id, featureKey: '1 Property', enabled: true },
      { planId: starter.id, featureKey: 'Email Support', enabled: true },
      // Pro features
      { planId: pro.id, featureKey: 'Unlimited Properties', enabled: true },
      { planId: pro.id, featureKey: 'Tenant Portal', enabled: true },
      { planId: pro.id, featureKey: 'Priority Support', enabled: true },
      // Enterprise features
      { planId: enterprise.id, featureKey: 'Custom Branding', enabled: true },
      { planId: enterprise.id, featureKey: 'Dedicated Manager', enabled: true },
      { planId: enterprise.id, featureKey: 'SLA', enabled: true },
    ],
    skipDuplicates: true,
  });

  // --- Assign Pro plan to org (PLAN mode) ---
  await prisma.organizationSubscription.create({
    data: {
      orgId: org.id,
      planId: pro.id,
      status: 'active',
      currentPeriodEnd: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    },
  });

  // Switch org to PLAN mode so APIs prefer PLAN
  await prisma.organization.update({ where: { id: org.id }, data: { subscriptionMode: 'PLAN' } });

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
