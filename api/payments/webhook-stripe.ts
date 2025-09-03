import type { VercelRequest, VercelResponse } from '@vercel/node';
import { stripeProvider } from '../../src/lib/payments/stripe';

export const config = { api: { bodyParser: false } } as any;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).end('Method Not Allowed'); }

  const chunks: Buffer[] = [];
  req.on('data', (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
  await new Promise((resolve) => req.on('end', resolve));
  const raw = Buffer.concat(chunks);
  const headers = new Headers();
  for (const [k, v] of Object.entries(req.headers)) {
    if (Array.isArray(v)) headers.set(k, v.join(', ')); else if (v) headers.set(k, String(v));
  }
  const webReq = new Request('https://webhook.local/stripe', { method: 'POST', headers, body: raw });

  try {
    await stripeProvider().handleWebhook(webReq);
  } catch (e) {
    console.error('stripe webhook error', (e as any)?.message || e);
    return res.status(500).json({ error: 'webhook error' });
  }

  return res.status(200).json({ ok: true });
}
