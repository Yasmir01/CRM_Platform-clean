import { prisma } from '@/lib/prisma';

export async function emitWebhook(event: string, payload: any, subscriberId?: string) {
  try {
    const subs = await prisma.webhookSubscription.findMany({ where: { active: true, event, OR: [{ subscriberId }, { subscriberId: null }] } });
    for (const s of subs) {
      try {
        // fire-and-forget; do not block main flow
        fetch(s.url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event, payload }) }).catch((e) => console.warn('webhook delivery failed', s.url, e));
      } catch (e) {
        console.warn('webhook emit error', e);
      }
    }
  } catch (e) {
    console.warn('emitWebhook error', e);
  }
}
