import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Property & Unit
  const property = await prisma.property.create({ data: { address: '123 Main St' } });
  const unit = await prisma.unit.create({ data: { number: 'A1', propertyId: property.id } });

  // Two tenants (old & new)
  const oldTenant = await prisma.tenant.create({ data: { name: 'Alice Johnson', email: 'alice@example.com' } });
  const newTenant = await prisma.tenant.create({ data: { name: 'Bob Smith', email: 'bob@example.com' } });

  // Lease for Alice (terminated, with a balance)
  await prisma.lease.create({
    data: {
      unitId: unit.id,
      tenantId: oldTenant.id,
      startDate: new Date('2023-01-01'),
      endDate: new Date('2024-06-30'),
      status: 'TERMINATED',
      ledgerEntries: {
        create: [
          { description: 'Jan 2024 Rent', amountCents: 12000, type: 'RENT' },
          { description: 'Feb 2024 Rent', amountCents: 12000, type: 'RENT' },
        ],
      },
    },
  });

  // Lease for Bob (active, no balance yet)
  await prisma.lease.create({
    data: {
      unitId: unit.id,
      tenantId: newTenant.id,
      startDate: new Date('2024-07-01'),
      status: 'ACTIVE',
    },
  });

  console.log('Seed complete: created sample property, unit, tenants, and leases.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
