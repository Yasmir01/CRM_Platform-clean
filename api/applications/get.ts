import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_db';
import { getUserOr401 } from '../../src/utils/authz';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).json({ error: 'Method Not Allowed' }); }
  const auth = getUserOr401(req, res); if (!auth) return;
  const id = String((req.query?.id as string) || '');
  if (!id) return res.status(400).json({ error: 'id required' });
  const app = await prisma.tenantApplication.findUnique({ where: { id }, include: { documents: true } });
  return res.status(200).json(app);
}
