import Stripe from 'stripe';

const key = process.env.STRIPE_SECRET_KEY as string | undefined;
export const stripe = key ? new Stripe(key, { apiVersion: '2024-06-20' }) : (null as any);
