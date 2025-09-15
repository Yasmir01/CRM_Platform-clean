import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.globalSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      ccFinanceOnResend: true,
      financeEmail: 'finance-team@yourcompany.com',
    },
  });

  console.log('✅ Seeded GlobalSettings');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
