import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_db';
import { getClientIp } from '../_lib/ip';
import { notify } from '../../src/lib/notify';
import { startTransUnionScreening } from '../../src/lib/screening/transunion';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ error: 'Method Not Allowed' }); }

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  const screeningId = String(body.screeningId || '');
  const consent = Boolean(body.consent);
  if (!screeningId || !consent) return res.status(400).json({ error: 'screeningId and consent required' });

  const screening = await prisma.tenantScreening.findUnique({ where: { id: screeningId } });
  if (!screening) return res.status(404).json({ error: 'screening not found' });

  const ipAddress = getClientIp(req);

  const existing = await prisma.tenantScreeningConsent.findFirst({ where: { screeningId } });
  if (existing) {
    await prisma.tenantScreeningConsent.update({ where: { id: existing.id }, data: { consented: true, consentedAt: new Date(), ipAddress } });
  } else {
    const application = await prisma.tenantApplication.findUnique({ where: { id: screening.appId } });
    await prisma.tenantScreeningConsent.create({ data: { screeningId, appId: screening.appId, tenantEmail: application?.email || '', consented: true, consentedAt: new Date(), ipAddress } });
  }

  await prisma.tenantScreening.update({ where: { id: screeningId }, data: { status: 'in_progress' } });

  try {
    if (screening.provider === 'transunion') {
      await startTransUnionScreening(screeningId, screening.appId);
    }
  } catch (e) {
    console.error('provider start error', (e as any)?.message || e);
  }

  try {
    const application = await prisma.tenantApplication.findUnique({ where: { id: screening.appId } });
    if (application?.email) {
      await notify({ email: application.email, type: 'TENANT_SCREENING_CONSENT_CONFIRMED', title: 'Consent recorded', message: 'Thank you. Your consent was recorded and screening will proceed.', meta: { screeningId } });
    }
  } catch {}

  return res.status(200).json({ ok: true });
}
