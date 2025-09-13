import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from './_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const propertyId = body.propertyId ? String(body.propertyId) : '';
    const name = body.name ? String(body.name).trim() : '';
    const email = body.email ? String(body.email).trim() : '';
    const phone = body.phone ? String(body.phone).trim() : null;
    const message = body.message ? String(body.message).trim() : null;
    const source = body.source ? String(body.source) : null;

    if (!propertyId || !name || !email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const lead = await prisma.lead.create({
      data: {
        propertyId,
        name,
        email,
        phone: phone || undefined,
        message: message || undefined,
        source: source || undefined,
      },
    });

    return res.status(201).json({ success: true, lead });
  } catch (err: any) {
    console.error('lead create error', err?.message || err);
    return res.status(500).json({ error: 'Server error' });
  }
}
