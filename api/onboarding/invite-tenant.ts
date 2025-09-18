import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_db';
import bcrypt from 'bcrypt';
import { getUserOr401 } from '../src/utils/authz';
import { sendEmail } from '../src/lib/mailer';

function randomPassword() {
  return Math.random().toString(36).slice(-10) + "A1!";
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  const inviter = getUserOr401(req, res);
  if (!inviter) return;

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const propertyId = String(body.propertyId || '');
    const unitId = body.unitId ? String(body.unitId) : undefined;
    const email = String((body.email || '').trim()).toLowerCase();
    const name = body.name ? String(body.name) : undefined;
    const leaseStart = body.leaseStart ? new Date(body.leaseStart) : undefined;
    const leaseEnd = body.leaseEnd ? new Date(body.leaseEnd) : undefined;
    const rentAmount = body.rentAmount !== undefined ? Number(body.rentAmount) : undefined;

    if (!propertyId || !email) return res.status(400).json({ error: 'Missing propertyId or email' });

    // Create or find user
    let user: any = await prisma.user.findUnique({ where: { email } }).catch(() => null);
    let createdNew = false;
    if (!user) {
      const pw = randomPassword();
      const hash = await bcrypt.hash(pw, 10);
      user = await prisma.user.create({ data: { email, password: hash, name: name || undefined, role: 'Tenant' } });
      createdNew = true;

      // send invite email with temporary password and link
      try {
        await sendEmail({
          to: email,
          subject: 'You are invited to Tenant Portal',
          text: `You have been invited. Please sign in and set your password. Temporary password: ${pw}`,
        });
      } catch (e) {
        console.warn('Failed to send invite email', e);
      }
    }

    // Create tenant record
    const tenantData: any = { userId: user.id, propertyId };
    if (name) tenantData.name = name;
    if (leaseStart) tenantData.leaseStart = leaseStart;
    if (leaseEnd) tenantData.leaseEnd = leaseEnd;
    if (rentAmount !== undefined) tenantData.rentAmount = rentAmount;
    if (unitId) tenantData.unitId = unitId;

    // Try to create tenant record. If already exists, update.
    let tenantRec: any = null;
    try {
      tenantRec = await prisma.tenant.create({ data: tenantData as any });
    } catch (e) {
      // maybe tenant exists, try update
      try {
        tenantRec = await prisma.tenant.updateMany({ where: { userId: user.id }, data: tenantData as any });
      } catch (e2) {
        console.warn('Failed to create/update tenant record', e2);
      }
    }

    return res.status(201).json({ ok: true, createdNew, user: { id: user.id, email: user.email }, tenant: tenantRec });
  } catch (err: any) {
    console.error('invite tenant error', err?.message || err);
    return res.status(500).json({ error: 'Server error' });
  }
}
