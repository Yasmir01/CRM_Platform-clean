import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_db';
import { getUserOr401 } from '../../src/utils/authz';
import { startStripeCheckout, startPayPalCheckout } from '../../src/lib/gateways';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const user = getUserOr401(req, res);
  if (!user) return;

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const tenantId = String(body.tenantId || '');
    const amount = Number(body.amount || 0);
    const gatewayId = String(body.gatewayId || '');

    if (!tenantId || !amount || !gatewayId) return res.status(400).json({ error: 'Missing fields' });

    const gateway = await prisma.paymentGateway.findUnique({ where: { id: gatewayId } });
    if (!gateway || !gateway.enabled) return res.status(400).json({ error: 'Gateway not available' });

    let redirectUrl = '';
    if (gateway.name.toLowerCase() === 'stripe') {
      redirectUrl = await startStripeCheckout(amount, tenantId, (gateway as any).config || {});
    } else if (gateway.name.toLowerCase() === 'paypal') {
      redirectUrl = await startPayPalCheckout(amount, tenantId, (gateway as any).config || {});
    } else {
      // Fallback: simulate success redirect
      redirectUrl = '/tenant/payments';
    }

    return res.status(200).json({ redirectUrl });
  } catch (e: any) {
    console.error('payments initiate error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
