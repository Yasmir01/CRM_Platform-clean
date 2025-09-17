import { PrismaClient, Role, Tier } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // Create a SuperAdmin
  const superAdmin = await prisma.user.upsert({
    where: { email: "superadmin@example.com" },
    update: {},
    create: {
      email: "superadmin@example.com",
      name: "Super Admin",
      password: "hashedpassword123", // replace with hashed password in production
      role: Role.SUPERADMIN,
    },
  });

  // Create Organization
  const org = await prisma.organization.upsert({
    where: { name: "Demo Organization" },
    update: {},
    create: {
      name: "Demo Organization",
      logoUrl: "https://placehold.co/200x200",
      tier: Tier.BASIC,
    },
  });

  // Attach SuperAdmin as user in this org
  await prisma.user.update({
    where: { id: superAdmin.id },
    data: { orgId: org.id },
  });

  // Org settings
  await prisma.orgSettings.upsert({
    where: { orgId: org.id },
    update: {},
    create: {
      orgId: org.id,
      allowImpersonation: true,
      allowExport: true,
      notifications: true,
      exportSchedule: "daily",
    },
  });

  // Subscription
  await prisma.subscription.create({
    data: {
      orgId: org.id,
      plan: Tier.BASIC,
      active: true,
      prorated: true,
    },
  });

  // Property
  const property = await prisma.property.create({
    data: {
      orgId: org.id,
      name: "Sunset Apartments",
      address: "123 Main St, Springfield",
    },
  });

  // Tenant
  const tenant = await prisma.tenant.create({
    data: {
      propertyId: property.id,
      name: "John Doe",
      email: "tenant@example.com",
      phone: "555-1234",
    },
  });

  // Reminder
  await prisma.reminder.create({
    data: {
      tenantId: tenant.id,
      message: "Rent is due",
      dueDate: new Date(new Date().setDate(new Date().getDate() + 7)),
    },
  });

  // Company + Contact
  const company = await prisma.company.create({
    data: {
      orgId: org.id,
      name: "Acme Supplies",
      industry: "Maintenance",
      website: "https://acmesupplies.example",
      phone: "555-0001",
      address: "456 Industrial Way, Springfield",
    },
  });

  await prisma.contact.create({
    data: {
      orgId: org.id,
      companyId: company.id,
      firstName: "Jane",
      lastName: "Smith",
      email: "jane.smith@acme.com",
      phone: "555-9876",
    },
  });

  console.log("✅ Seed completed.");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
