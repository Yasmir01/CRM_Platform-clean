import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_db';
import { safeParse } from '../../src/utils/safeJson';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const body = typeof req.body === 'string' ? safeParse(req.body, {}) : (req.body || {});
    const propertyId = String(body.propertyId || '').trim();
    const unit = body.unit ? String(body.unit) : undefined;
    const applicantName = String(body.applicantName || '').trim();
    const email = String((body.email || '')).trim().toLowerCase();
    const phone = body.phone ? String(body.phone) : undefined;
    const employment = body.employment ? String(body.employment) : undefined;
    const income = body.income ? Number(body.income) : undefined;
    const rentalHistory = body.rentalHistory ? String(body.rentalHistory) : undefined;
    const references = body.references ? String(body.references) : undefined;
    const documentUrl = body.documentUrl ? String(body.documentUrl) : undefined;

    if (!propertyId || !applicantName || !email) return res.status(400).json({ error: 'Missing required fields' });

    const application = await prisma.application.create({
      data: {
        propertyId,
        unit: unit || undefined,
        applicantName,
        email,
        phone,
        employment,
        income: income as any,
        rentalHistory,
        references,
        documentUrl,
      },
    });

    return res.status(200).json(application);
  } catch (e: any) {
    console.error('applications/create error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
