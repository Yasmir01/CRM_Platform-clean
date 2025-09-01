import { prisma } from './_db';
import { requireAdminOr403 } from './_auth';

export default async function handler(req: any, res: any) {
  try {
    if (req.method === 'GET') {
      const items = await prisma.subscriber.findMany({ orderBy: { createdAt: 'desc' } });
      return res.status(200).json(items);
    }

    if (req.method === 'POST') {
      if (!requireAdminOr403(req, res)) return;
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const item = await prisma.subscriber.create({
        data: {
          email: body.email,
          companyName: body.companyName || null,
        }
      });
      return res.status(201).json(item);
    }

    if (req.method === 'PUT' || req.method === 'PATCH') {
      if (!requireAdminOr403(req, res)) return;
      const id = (req.query.id as string) || (req.body && (req.body as any).id);
      if (!id) return res.status(400).json({ error: 'Missing id' });
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const updated = await prisma.subscriber.update({
        where: { id },
        data: {
          email: body.email,
          companyName: body.companyName ?? undefined,
        }
      });
      return res.status(200).json(updated);
    }

    if (req.method === 'DELETE') {
      if (!requireAdminOr403(req, res)) return;
      const id = req.query.id as string;
      if (!id) return res.status(400).json({ error: 'Missing id' });
      await prisma.subscriber.delete({ where: { id } });
      return res.status(204).end();
    }

    res.setHeader('Allow', 'GET,POST,PUT,PATCH,DELETE');
    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error: any) {
    console.error('Subscribers API error:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error?.message });
  }
}
