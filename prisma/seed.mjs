import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function upsertSubscriptionPlanByName(data) {
  const existing = await prisma.subscriptionPlan.findFirst({ where: { name: data.name } })
  if (existing) {
    return prisma.subscriptionPlan.update({ where: { id: existing.id }, data })
  }
  return prisma.subscriptionPlan.create({ data })
}

async function upsertProductByName(data) {
  const existing = await prisma.product.findFirst({ where: { name: data.name } })
  if (existing) {
    return prisma.product.update({ where: { id: existing.id }, data })
  }
  return prisma.product.create({ data })
}

async function main() {
  const plans = [
    {
      name: 'Starter',
      price: 0,
      description: 'Entry plan suitable for evaluation and small teams.',
      userLimit: 3,
      propertyLimit: 10,
      features: ['contacts', 'notes', 'basic-reports'],
      pages: ['dashboard', 'contacts', 'reports'],
      tools: ['export', 'import'],
      services: ['email-support'],
      paymentTypes: ['card'],
      backupTypes: ['daily']
    },
    {
      name: 'Growth',
      price: 49,
      description: 'For growing teams needing automation and analytics.',
      userLimit: 25,
      propertyLimit: 250,
      features: ['contacts', 'notes', 'workflows', 'advanced-reports'],
      pages: ['dashboard', 'contacts', 'reports', 'automation'],
      tools: ['export', 'import', 'bulk-edit'],
      services: ['priority-support'],
      paymentTypes: ['card'],
      backupTypes: ['daily', 'weekly']
    },
    {
      name: 'Scale',
      price: 199,
      description: 'Advanced capabilities and higher limits.',
      userLimit: 250,
      propertyLimit: 2000,
      features: ['contacts', 'notes', 'workflows', 'ai-assistant', 'advanced-reports'],
      pages: ['dashboard', 'contacts', 'reports', 'automation', 'admin'],
      tools: ['export', 'import', 'bulk-edit', 'audit-log'],
      services: ['priority-support', 'sla'],
      paymentTypes: ['card', 'invoice'],
      backupTypes: ['daily', 'weekly', 'monthly']
    }
  ]

  for (const p of plans) {
    const plan = await upsertSubscriptionPlanByName(p)
    console.log(`Seeded plan: ${plan.name}`)
  }

  const products = [
    { name: 'Onboarding Package', description: 'White-glove onboarding service.', type: 'service', price: 499, isActive: true, category: 'services', tags: ['onboarding'] },
    { name: 'SMS Credits 10k', description: 'Add-on credits for messaging.', type: 'addon', price: 99, isActive: true, category: 'addons', tags: ['sms','credits'] },
    { name: 'Priority Support', description: '24/7 support channel.', type: 'subscription', price: 149, isActive: true, category: 'support', tags: ['support','priority'] }
  ]

  for (const p of products) {
    const product = await upsertProductByName(p)
    console.log(`Seeded product: ${product.name}`)
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
    process.exit(0)
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
