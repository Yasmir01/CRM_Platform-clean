import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔎 Running Prisma sanity test...");

  const plans = await prisma.subscriptionPlan.findMany({
    take: 5,
  });
  console.log("📦 Subscription Plans:", plans);

  const users = await prisma.user.findMany({
    take: 5,
  });
  console.log("👤 Users:", users);

  console.log("✅ Sanity test complete!");
}

main()
  .catch((e) => {
    console.error("❌ Test failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
