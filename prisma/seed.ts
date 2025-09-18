import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create SU user
  const superUser = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      name: "Super Admin",
      role: "SU",
    },
  });

  // Create SA user
  const sysAdmin = await prisma.user.upsert({
    where: { email: "sysadmin@example.com" },
    update: {},
    create: {
      email: "sysadmin@example.com",
      name: "System Admin",
      role: "SA",
    },
  });

  // Create Subscriber user
  const subscriber = await prisma.user.upsert({
    where: { email: "subscriber@example.com" },
    update: {},
    create: {
      email: "subscriber@example.com",
      name: "Subscriber User",
      role: "Subscriber",
    },
  });

  console.log({ superUser, sysAdmin, subscriber });
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
