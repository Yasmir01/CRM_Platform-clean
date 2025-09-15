import { getUserOr401 } from '../../src/utils/authz';
import { ensurePermission } from '../../src/lib/authorize';
import { prisma } from '../_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === 'GET') {
      const user = getUserOr401(req, res);
      if (!user) return;

      const q = String((req.query as any).q || '').trim();
      const industry = String((req.query as any).industry || '');
      const take = Math.min(1000, Number((req.query as any).take || 50));
      const skip = Math.max(0, Number((req.query as any).skip || 0));

      const where: any = {};
      if (industry) where.industry = industry;
      if (q) {
        const qLower = q.toLowerCase();
        where.OR = [
          { name: { contains: qLower, mode: 'insensitive' } },
          { domain: { contains: qLower, mode: 'insensitive' } },
        ];
      }

      const companies = await prisma.company.findMany({ where, take, skip, orderBy: { updatedAt: 'desc' } });
      return res.status(200).json(companies);
    }

    if (req.method === 'POST') {
      const user = ensurePermission(req, res, 'companies:manage');
      if (!user) return;

      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const data: any = {
        name: String(body.name || '').trim(),
        domain: body.domain || null,
        industry: body.industry || null,
      };
      if (!data.name) return res.status(400).json({ error: 'Missing name' });

      const created = await prisma.company.create({ data });
      return res.status(201).json(created);
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (e: any) {
    console.error('companies handler error', e?.message || e);
    return res.status(500).json({ error: 'Server error' });
  }
}
