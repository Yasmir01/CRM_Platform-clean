import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clear existing data if needed (order matters)
  await prisma.ticket.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.serviceProvider.deleteMany();
  await prisma.company.deleteMany();

  // Companies
  const company1 = await prisma.company.create({
    data: {
      name: "Acme Real Estate",
      industry: "Real Estate",
      email: "info@acme-re.com",
      phone: "555-111-2222",
      address: "100 Main St",
    },
  });

  const company2 = await prisma.company.create({
    data: {
      name: "TechWorks Inc.",
      industry: "Technology",
      email: "support@techworks.com",
      phone: "555-333-4444",
      address: "200 Tech Ave",
    },
  });

  // Service Providers (linked to companies)
  await prisma.serviceProvider.createMany({
    data: [
      {
        name: "QuickFix Plumbing",
        serviceType: "Plumbing",
        phone: "555-123-4567",
        email: "support@quickfix.com",
        address: "12 Flow Rd",
        notes: "Preferred for plumbing emergencies",
        companyId: company1.id,
      },
      {
        name: "BrightSpark Electricians",
        serviceType: "Electrical",
        phone: "555-987-6543",
        email: "contact@brightspark.com",
        address: "34 Volt St",
        notes: "Handles electrical inspections",
        companyId: company2.id,
      },
      {
        name: "CleanSweep Janitorial",
        serviceType: "Cleaning",
        phone: "555-222-3333",
        email: "hello@cleansweep.com",
        address: "56 Clean Blvd",
        notes: "Daily janitorial services",
        companyId: company1.id,
      },
    ],
    skipDuplicates: true,
  });

  // Contacts (linked to companies)
  await prisma.contact.createMany({
    data: [
      {
        firstName: "Alice",
        lastName: "Johnson",
        email: "alice@acme-re.com",
        phone: "555-111-9999",
        companyId: company1.id,
      },
      {
        firstName: "Bob",
        lastName: "Martinez",
        email: "bob@techworks.com",
        phone: "555-333-7777",
        companyId: company2.id,
      },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Seed complete!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
