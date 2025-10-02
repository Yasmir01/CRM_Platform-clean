import Stripe from 'stripe';
import { prisma } from '../../api/_db';
import { prisma } from '../../pages/api/_db';

const stripeKey = process.env.STRIPE_SECRET_KEY as string | undefined;
const stripe = stripeKey ? new Stripe(stripeKey, { apiVersion: '2024-06-20' }) : null as any;

export async function syncSeats(accountId: string) {
  if (!stripe) {
    console.warn('Stripe not configured; skip syncSeats');
    return;
  }

  const account = await prisma.account.findUnique({ where: { id: accountId }, include: { users: true } });
  if (!account) {
    console.warn('Account not found for syncSeats', accountId);
    return;
  }

  const seatCount = (account.users || []).length || 1;
  const subId = account.stripeSubId;
  const perSeatPrice = process.env.STRIPE_PRICE_PER_SEAT;

  if (!subId) {
    console.warn('No stripeSubId for account; cannot sync seats', accountId);
    await prisma.account.update({ where: { id: accountId }, data: { seats: seatCount } });
    return;
  }

  try {
    const subscription = await stripe.subscriptions.retrieve(subId, { expand: ['items.data.price'] });
    const items = (subscription.items && (subscription.items as any).data) || [];

    // find per-seat item by matching price id
    let seatItem = items.find((it: any) => String(it.price?.id) === String(perSeatPrice));

    if (seatItem) {
      // update existing item quantity
      await stripe.subscriptions.update(subId, {
        items: [{ id: seatItem.id, quantity: seatCount }],
        proration_behavior: 'create_prorations',
      });
    } else if (perSeatPrice) {
      // add new item for seats
      await stripe.subscriptions.update(subId, {
        items: [{ price: perSeatPrice, quantity: seatCount }],
        proration_behavior: 'create_prorations',
      });
    } else {
      console.warn('No per-seat price configured; cannot update seats on Stripe');
    }

    // Persist seat count
    await prisma.account.update({ where: { id: accountId }, data: { seats: seatCount } });
  } catch (e) {
    console.error('syncSeats error', e);
  }
}
