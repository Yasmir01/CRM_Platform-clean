import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../../_db';
import { getUserOr401 } from '../../src/utils/authz';
import jsPDF from 'jspdf';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const userPayload = getUserOr401(req, res);
  if (!userPayload) return;

  const userId = String(userPayload.sub || userPayload?.id || '');

  const id = req.query && (req.query as any).id ? String((req.query as any).id) : null;
  if (!id) return res.status(400).json({ error: 'Missing id' });

  const payment = await prisma.rentPayment.findUnique({ where: { id }, include: { tenant: true, property: true } as any });
  if (!payment) return res.status(404).json({ error: 'Not found' });

  // Only allow if the requester is the tenant who made the payment or a SUPER_ADMIN / ADMIN
  const dbUser = await prisma.user.findUnique({ where: { id: userId } });
  const isAdmin = dbUser && ['SUPER_ADMIN', 'ADMIN'].includes(String(dbUser.role || '').toUpperCase());

  if (!isAdmin && String(payment.tenantId) !== userId) {
    return res.status(403).json({ error: 'Not allowed' });
  }

  // Generate PDF
  try {
    const doc = new (jsPDF as any)();
    doc.text('Payment Receipt', 14, 20);
    doc.text(`Tenant: ${payment.tenant?.name || ''}`, 14, 30);
    doc.text(`Property: ${payment.property?.address || payment.property?.name || ''}`, 14, 40);
    doc.text(`Amount: $${(payment.amount || 0).toFixed(2)}`, 14, 50);
    doc.text(`Date: ${new Date(payment.createdAt).toLocaleDateString()}`, 14, 60);
    doc.text(`Status: ${payment.status}`, 14, 70);

    const pdf = doc.output('arraybuffer');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="receipt-${payment.id}.pdf"`);
    return res.status(200).send(Buffer.from(pdf));
  } catch (e: any) {
    console.error('receipt generation error', e?.message || e);
    return res.status(500).json({ error: 'Server error' });
  }
}
