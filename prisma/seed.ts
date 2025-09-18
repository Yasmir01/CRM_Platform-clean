import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clear old data (respect relation order)
  await prisma.ticket.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.serviceProvider.deleteMany();
  await prisma.company.deleteMany();

  // --- Companies ---
  const acme = await prisma.company.create({
    data: {
      name: "Acme Corp",
      industry: "Software",
      website: "https://acme.example.com",
    },
  });

  const globex = await prisma.company.create({
    data: {
      name: "Globex Inc",
      industry: "Consulting",
      website: "https://globex.example.com",
    },
  });

  // --- Contacts ---
  const john = await prisma.contact.create({
    data: {
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@acme.com",
      phone: "+1 555-1234",
      companyId: acme.id,
    },
  });

  const jane = await prisma.contact.create({
    data: {
      firstName: "Jane",
      lastName: "Smith",
      email: "jane.smith@globex.com",
      phone: "+1 555-5678",
      companyId: globex.id,
    },
  });

  // --- Tickets ---
  await prisma.ticket.createMany({
    data: [
      {
        title: "Website not loading",
        description: "Client reports CRM login page is down.",
        priority: "High",
        status: "Open",
      },
      {
        title: "Invoice PDF issue",
        description: "Generated invoices missing company logo.",
        priority: "Medium",
        status: "In Progress",
      },
      {
        title: "Feature request: Dark mode",
        description: "Subscriber requested dark theme for dashboard.",
        priority: "Low",
        status: "Open",
      },
    ],
  });

  // --- Service Providers ---
  await prisma.serviceProvider.createMany({
    data: [
      {
        name: "TechFix IT Solutions",
        category: "IT Support",
        phone: "+1 555-1111",
        email: "support@techfix.com",
        website: "https://techfix.example.com",
      },
      {
        name: "QuickPlumb Services",
        category: "Plumbing",
        phone: "+1 555-2222",
        email: "info@quickplumb.com",
        website: "https://quickplumb.example.com",
      },
      {
        name: "BrightSpark Electricians",
        category: "Electrical",
        phone: "+1 555-3333",
        email: "contact@brightspark.com",
        website: "https://brightspark.example.com",
      },
    ],
  });

  console.log("✅ Seed data created: Companies, Contacts, Tickets, Service Providers");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
