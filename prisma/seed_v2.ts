import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // 1. SuperAdmin
  const superAdmin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      name: "Super Admin",
      role: "SUPERADMIN",
    },
  });

  // 2. Organization + OrgSettings
  const org = await prisma.organization.upsert({
    where: { id: "org_1" },
    update: {},
    create: {
      id: "org_1",
      name: "Default Org",
      users: {
        connect: { id: superAdmin.id },
      },
      orgSettings: {
        create: {
          exportSchedule: "daily",
          notifications: true,
        },
      },
    },
  });

  // 3. Property + Tenant + Reminder
  const property = await prisma.property.create({
    data: {
      name: "Main Street Building",
      orgId: org.id,
    },
  });

  const tenant = await prisma.user.create({
    data: {
      email: "tenant@example.com",
      name: "John Tenant",
      role: "USER",
    },
  });

  await prisma.reminder.create({
    data: {
      message: "Pay rent",
      dueDate: new Date(),
      // adjust field to match schema (tenantId vs userId)
      tenantId: tenant.id,
    },
  });

  // 4. Company + Contact
  const company = await prisma.company.create({
    data: {
      name: "Acme Inc.",
      orgId: org.id,
    },
  });

  const contact = await prisma.contact.create({
    data: {
      name: "Jane Doe",
      email: "jane@acme.com",
      companyId: company.id,
      orgId: org.id,
    },
  });

  // 5. Deal (linked to company + contact + org)
  await prisma.deal.create({
    data: {
      title: "Acme SaaS Subscription",
      stage: "Negotiation",
      amount: 12000,
      orgId: org.id,
      companyId: company.id,
      contactId: contact.id,
    },
  });

  // 6. Subscription (if subscriptionPlan model exists)
  try {
    const plan = await prisma.subscription.create({
      data: {
        orgId: org.id,
        plan: "BASIC",
        active: true,
      },
    });

    // Optionally link plan to account/user if schema supports it
  } catch (e) {
    // ignore if subscriptionPlan model/fields differ
    console.warn("Skipping subscription creation: schema may differ", e);
  }

  console.log("✅ Seed data created successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
