import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const email = process.env.DEMO_EMAIL || 'yasmir001@pm.me'
  const companyName = process.env.DEMO_COMPANY || 'Houses Pro'
  const planName = process.env.DEMO_PLAN_NAME || 'Starter'

  const plan = await prisma.subscriptionPlan.findFirst({ where: { name: planName } })
  if (!plan) {
    throw new Error(`Required plan not found: ${planName}`)
  }

  let subscriber = await prisma.subscriber.findUnique({ where: { email } })
  if (subscriber) {
    subscriber = await prisma.subscriber.update({ where: { id: subscriber.id }, data: { companyName } })
    console.log(`Updated subscriber: ${subscriber.email}`)
  } else {
    subscriber = await prisma.subscriber.create({ data: { email, companyName } })
    console.log(`Created subscriber: ${subscriber.email}`)
  }

  const existingSub = await prisma.subscription.findFirst({ where: { subscriberId: subscriber.id } })
  if (!existingSub) {
    const created = await prisma.subscription.create({ data: { subscriberId: subscriber.id, planId: plan.id, status: 'active', cancelAtPeriodEnd: false } })
    console.log(`Created subscription with plan: ${plan.name}`)
  } else {
    const updated = await prisma.subscription.update({ where: { id: existingSub.id }, data: { planId: plan.id, status: 'active', cancelAtPeriodEnd: false } })
    console.log(`Updated subscription to plan: ${plan.name}`)
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
