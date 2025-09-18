import type { NextApiRequest, NextApiResponse } from "next";
import prisma from '@/lib/prisma';
import { getUserOr401 } from '@/utils/authz';
import { runWithRequestSession } from '@/lib/runWithRequestSession';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = getUserOr401(req as any, res as any);
  if (!user) return;

  return runWithRequestSession(req as any, async () => {
    try {
      switch (req.method) {
        case 'GET': {
          const { search = '', page = '1', pageSize = '10' } = req.query as Record<string, string>;
          const skip = (parseInt(page, 10) - 1) * parseInt(pageSize, 10);
          const take = Math.max(parseInt(pageSize, 10), 1);

          const where: any = search
            ? { OR: [ { name: { contains: search as string, mode: 'insensitive' } }, { serviceType: { contains: search as string, mode: 'insensitive' } } ] }
            : {};

          const [providers, total] = await Promise.all([
            prisma.serviceProvider.findMany({ where, skip, take, orderBy: { createdAt: 'desc' }, include: { company: true } }),
            prisma.serviceProvider.count({ where }),
          ]);

          return res.status(200).json({ data: providers, total, page: parseInt(page, 10), pageSize: take });
        }

        case 'POST': {
          const { name, serviceType, phone, email, notes, address, companyId } = req.body || {};
          if (!name || typeof name !== 'string' || !name.trim()) return res.status(400).json({ error: 'name is required' });

          const provider = await prisma.serviceProvider.create({
            data: {
              name: String(name).trim(),
              serviceType: serviceType || null,
              phone: phone || null,
              email: email || null,
              notes: notes || null,
              address: address || null,
              companyId: companyId || null,
            },
            include: { company: true },
          });
          return res.status(201).json(provider);
        }

        case 'PUT': {
          const { id, name, serviceType, phone, email, notes, address, companyId } = req.body || {};
          if (!id || typeof id !== 'string') return res.status(400).json({ error: 'id is required' });

          const data: any = {};
          if (name !== undefined) data.name = String(name);
          if (serviceType !== undefined) data.serviceType = serviceType;
          if (phone !== undefined) data.phone = phone;
          if (email !== undefined) data.email = email;
          if (notes !== undefined) data.notes = notes;
          if (address !== undefined) data.address = address;
          if (companyId !== undefined) data.companyId = companyId;

          const updated = await prisma.serviceProvider.update({ where: { id: String(id) }, data, include: { company: true } });
          return res.status(200).json(updated);
        }

        case 'DELETE': {
          const { id } = req.body || {};
          if (!id || typeof id !== 'string') return res.status(400).json({ error: 'id is required' });

          await prisma.serviceProvider.delete({ where: { id: String(id) } });
          return res.status(204).end();
        }

        default:
          res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
          return res.status(405).end(`Method ${req.method} Not Allowed`);
      }
    } catch (err: any) {
      console.error('API error (service-providers):', err);
      return res.status(500).json({ error: err?.message || 'Internal Server Error' });
    }
  });
}
