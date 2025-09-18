import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_db';
import { getUserOr401 } from '../src/utils/authz';
import { sendEmail } from '../src/lib/mailer';
import crypto from 'crypto';

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

    // Create tenant record with status invited (if not exists)
    let tenant = await prisma.tenant.findFirst({ where: { email } }).catch(() => null);
    if (!tenant) {
      tenant = await prisma.tenant.create({ data: {
        propertyId,
        unitId: unitId || undefined,
        email,
        name: name || undefined,
        leaseStart: leaseStart || undefined,
        leaseEnd: leaseEnd || undefined,
        rentAmount: rentAmount || undefined,
        status: 'invited',
      } });
    } else {
      // update existing tenant to invited state
      try {
        await prisma.tenant.update({ where: { id: tenant.id }, data: { status: 'invited', propertyId, unitId: unitId || undefined } });
      } catch (e) {}
    }

    // Generate token
    const token = crypto.randomBytes(20).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await prisma.tenantInvite.create({ data: { tenantId: tenant.id, email, token, expiresAt } });

    // Send invite email
    const host = process.env.NEXT_PUBLIC_APP_URL || `https://${req.headers.host}`;
    const link = `${host}/onboarding/tenant/accept?token=${token}`;

    try {
      await sendEmail({
        to: email,
        subject: 'You are invited to Tenant Portal',
        text: `You have been invited to the Tenant Portal for unit ${unitId || ''}. Click here to accept and set your password: ${link}`,
        html: `<p>You have been invited to the Tenant Portal for unit ${unitId || ''}.</p><p><a href="${link}">Click here to accept and set your password</a></p>`,
      });
    } catch (e) {
      console.warn('Failed to send invite email', e);
    }

    return res.status(201).json({ ok: true, tenantId: tenant.id });
  } catch (err: any) {
    console.error('create invite error', err?.message || err);
    return res.status(500).json({ error: 'Server error' });
  }
}
