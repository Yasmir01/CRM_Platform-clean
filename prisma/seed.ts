import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clear old data
  await prisma.ticket.deleteMany();

  // Insert sample tickets
  await prisma.ticket.createMany({
    data: [
      {
        title: "Website not loading",
        description: "Client reports that the CRM login page is not loading.",
        priority: "High",
        status: "Open",
      },
      {
        title: "Invoice PDF issue",
        description: "Generated invoices are missing company logo.",
        priority: "Medium",
        status: "In Progress",
      },
      {
        title: "Feature request: Dark mode",
        description: "Subscriber requested a dark theme option for dashboard.",
        priority: "Low",
        status: "Open",
      },
    ],
  });

  console.log("✅ Tickets seeded successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
