// prisma/seed.prod.ts
import { PrismaClient, Role, Tier } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function main() {
  console.log('🌱 Seeding PRODUCTION database with baseline data...');

  // Load password from environment
  const plainPassword = process.env.SUPERADMIN_PASSWORD || "ChangeMe123!";
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  // 1. Create a default organization
  const org = await prisma.organization.upsert({
    where: { name: "Default Organization" },
    update: {},
    create: {
      name: "Default Organization",
      tier: Tier.BASIC,
    },
  });

  // 2. Create a super admin user
  await prisma.user.upsert({
    where: { email: "superadmin@example.com" },
    update: {},
    create: {
      email: "superadmin@example.com",
      name: "Super Admin",
      password: hashedPassword,
      role: Role.SUPERADMIN,
      orgId: org.id,
    },
  });

  // 3. Create baseline subscription
  await prisma.subscription.upsert({
    where: { orgId: org.id },
    update: {},
    create: {
      orgId: org.id,
      plan: Tier.BASIC,
      active: true,
    },
  });

  // 4. Create baseline global settings
  await prisma.globalSettings.upsert({
    where: { id: "global" },
    update: {},
    create: {
      id: "global",
      maintenance: false,
    },
  });

  console.log("✅ PRODUCTION database seeded with baseline data.");
  console.log(`🔑 Default superadmin: superadmin@example.com / ${plainPassword}`);
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
