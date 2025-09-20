import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from './_db';
import { getUserOr401 } from '../src/utils/authz';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const user = getUserOr401(req, res);
    if (!user) return; // getUserOr401 already responded with 401

    if (req.method === 'GET') {
      const take = Math.min(1000, Number((req.query as any).take || 100));
      const properties = await prisma.property.findMany({ include: { leases: true }, take, orderBy: { createdAt: 'desc' } });
      return res.status(200).json(properties);
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const name = String(body.name || '').trim();
      const address = body.address ? String(body.address) : null;
      const units = Number(body.units || 0);

      if (!name) return res.status(400).json({ error: 'Missing name' });

      const created = await prisma.property.create({ data: { name, address, units } });
      return res.status(201).json(created);
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).end('Method Not Allowed');
  } catch (e: any) {
    console.error('properties handler error', e?.message || e);
    return res.status(500).json({ error: 'Server error' });
  }
}
