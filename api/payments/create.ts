import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_db';
import { getUserOr401 } from '../../src/utils/authz';
import { getPaymentProvider } from '../../src/lib/payments/provider';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ error: 'Method Not Allowed' }); }
  const auth = getUserOr401(req, res); if (!auth) return;

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  const { leaseId, tenantId, amount, method } = body as { leaseId: string, tenantId: string, amount: number, method: string };
  if (!leaseId || !tenantId || !amount || !method) return res.status(400).json({ error: 'missing fields' });

  const provider = await getPaymentProvider(method);

  const xfProto = (req.headers['x-forwarded-proto'] as string) || 'https';
  const xfHost = (req.headers['x-forwarded-host'] as string) || (req.headers.host as string) || '';
  const baseUrl = (process.env as any).PUBLIC_BASE_URL || (xfHost ? `${xfProto}://${xfHost}` : '');

  const result = await provider.createPayment({ leaseId, tenantId, amount: Number(amount), currency: 'usd', method, returnUrl: `${baseUrl}/tenant/payments` });

  await prisma.rentPayment.create({ data: { leaseId, tenantId, amount: Number(amount), method, status: result.status, transactionId: result.id } });

  return res.status(200).json(result);
}
