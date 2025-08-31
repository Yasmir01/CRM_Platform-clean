import { ProductType } from '@prisma/client';
import { prisma } from './_db';

export default async function handler(req: any, res: any) {
  try {
    if (req.method === 'GET') {
      const { type } = req.query as { type?: ProductType };
      const where = type ? { type } : {};
      const items = await prisma.product.findMany({ where, orderBy: { createdAt: 'desc' } });
      return res.status(200).json(items);
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const item = await prisma.product.create({
        data: {
          name: body.name,
          description: body.description || null,
          type: (body.type || 'product') as ProductType,
          price: Number(body.price || 0),
          isActive: body.isActive !== false,
          category: body.category || null,
          tags: Array.isArray(body.tags) ? body.tags : [],
        }
      });
      return res.status(201).json(item);
    }

    if (req.method === 'PUT' || req.method === 'PATCH') {
      const id = (req.query.id as string) || (req.body && (req.body as any).id);
      if (!id) return res.status(400).json({ error: 'Missing id' });
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const updated = await prisma.product.update({
        where: { id },
        data: {
          name: body.name,
          description: body.description ?? undefined,
          type: body.type as ProductType | undefined,
          price: body.price !== undefined ? Number(body.price) : undefined,
          isActive: typeof body.isActive === 'boolean' ? body.isActive : undefined,
          category: body.category ?? undefined,
          tags: Array.isArray(body.tags) ? body.tags : undefined,
        }
      });
      return res.status(200).json(updated);
    }

    if (req.method === 'DELETE') {
      const id = req.query.id as string;
      if (!id) return res.status(400).json({ error: 'Missing id' });
      await prisma.product.delete({ where: { id } });
      return res.status(204).end();
    }

    res.setHeader('Allow', 'GET,POST,PUT,PATCH,DELETE');
    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error: any) {
    console.error('Products API error:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error?.message });
  }
}
