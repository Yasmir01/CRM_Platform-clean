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
    const email = String((body.email || '').trim()).toLowerCase();
    const name = body.name ? String(body.name) : undefined;
    const category = body.category ? String(body.category) : undefined;

    if (!email) return res.status(400).json({ error: 'Missing email' });

    // Create a service provider record if not exists
    let sp: any = await prisma.serviceProvider.findFirst({ where: { email } }).catch(() => null);
    if (!sp) {
      try {
        sp = await prisma.serviceProvider.create({ data: { name: name || email.split('@')[0], email: email, serviceType: category || undefined } });
      } catch (e) {
        console.warn('Failed to create serviceProvider record', e);
      }
    }

    const token = crypto.randomBytes(20).toString('hex');
    const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days

    await prisma.vendorInvite.create({ data: { vendorId: sp?.id || undefined, email, name: name || undefined, category: category || undefined, token, expiresAt } });

    const host = process.env.NEXT_PUBLIC_APP_URL || `https://${req.headers.host}`;
    const link = `${host}/onboarding/vendor/accept?token=${token}`;

    try {
      await sendEmail({
        to: email,
        subject: 'You are invited to Vendor Portal',
        text: `You have been invited as a vendor. Click to sign up: ${link}`,
        html: `<p>You have been invited as a vendor. Click to sign up:</p><p><a href="${link}">Accept invitation</a></p>`,
      });
    } catch (e) {
      console.warn('Failed to send vendor invite email', e);
    }

    return res.status(201).json({ ok: true });
  } catch (err: any) {
    console.error('create vendor invite error', err?.message || err);
    return res.status(500).json({ error: 'Server error' });
  }
}
