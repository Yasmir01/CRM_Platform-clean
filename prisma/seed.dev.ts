// prisma/seed.dev.ts
import { PrismaClient, Role, Tier } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

export async function main() {
  console.log('🌱 Seeding DEV database with demo data...');

  // Create 3 orgs
  for (let i = 0; i < 3; i++) {
    const org = await prisma.organization.create({
      data: {
        name: faker.company.name(),
        logoUrl: faker.image.url(),
        tier: [Tier.FREE, Tier.BASIC, Tier.PREMIUM][i % 3],
      },
    });

    // Create 1 admin + 3 normal users per org
    await prisma.user.create({
      data: {
        email: `admin${i}@example.com`,
        name: `Admin ${i}`,
        password: 'hashed-password', // replace with bcrypt later
        role: Role.ADMIN,
        orgId: org.id,
      },
    });

    for (let u = 0; u < 3; u++) {
      await prisma.user.create({
        data: {
          email: faker.internet.email(),
          name: faker.person.fullName(),
          password: 'hashed-password',
          role: Role.USER,
          orgId: org.id,
        },
      });
    }

    // Create 2 companies with contacts
    for (let c = 0; c < 2; c++) {
      const company = await prisma.company.create({
        data: {
          name: faker.company.name(),
          industry: faker.company.buzzPhrase(),
          orgId: org.id,
        },
      });

      for (let ct = 0; ct < 2; ct++) {
        await prisma.contact.create({
          data: {
            name: faker.person.fullName(),
            email: faker.internet.email(),
            phone: faker.phone.number(),
            companyId: company.id,
            orgId: org.id,
          },
        });
      }
    }

    // Create 1 property with 2 tenants
    const property = await prisma.property.create({
      data: {
        name: `${faker.location.city()} Complex`,
        address: faker.location.streetAddress(),
        orgId: org.id,
      },
    });

    for (let t = 0; t < 2; t++) {
      await prisma.tenant.create({
        data: {
          name: faker.person.fullName(),
          email: faker.internet.email(),
          phone: faker.phone.number(),
          propertyId: property.id,
        },
      });
    }

    // Create 1 deal
    await prisma.deal.create({
      data: {
        title: faker.company.catchPhrase(),
        description: faker.lorem.sentence(),
        amount: faker.number.int({ min: 1000, max: 20000 }),
        stage: faker.helpers.arrayElement([
          'Lead',
          'Negotiation',
          'Closed Won',
          'Closed Lost',
        ]),
        probability: faker.number.int({ min: 10, max: 90 }),
        orgId: org.id,
      },
    });

    // Create subscription
    await prisma.subscription.create({
      data: {
        orgId: org.id,
        plan: [Tier.FREE, Tier.BASIC, Tier.PREMIUM][i % 3],
        active: true,
      },
    });
  }

  console.log('✅ DEV Database seeded with multiple orgs, users, properties, and deals');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
