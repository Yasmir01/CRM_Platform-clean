import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_db';
import { getUserOr401 } from '../../src/utils/authz';
import { notify } from '../../src/lib/notify';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ error: 'Method Not Allowed' }); }
  const auth = getUserOr401(req, res); if (!auth) return;
  const userId = String((auth as any).sub || (auth as any).id);
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return res.status(401).json({ error: 'unauthorized' });
  if (!['ADMIN','MANAGER','SUPER_ADMIN'].includes(user.role as any)) return res.status(403).json({ error: 'forbidden' });

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  const appId = String(body.appId || '');
  const provider = String(body.provider || 'transunion');
  if (!appId) return res.status(400).json({ error: 'appId required' });

  const screening = await prisma.tenantScreening.create({ data: { appId, provider, status: 'awaiting_consent' } });

  const application = await prisma.tenantApplication.findUnique({ where: { id: appId } });
  try {
    if (application?.email) {
      const xfProto = (req.headers['x-forwarded-proto'] as string) || 'https';
      const xfHost = (req.headers['x-forwarded-host'] as string) || (req.headers.host as string) || '';
      const baseUrl = (process.env as any).PUBLIC_BASE_URL || (xfHost ? `${xfProto}://${xfHost}` : '');
      const consentUrl = `${baseUrl}/consent/${screening.id}`;

      await notify({
        email: application.email,
        title: 'Consent Required for Tenant Screening',
        message: `A background/credit screening is required for your application. Please review and consent here: ${consentUrl}`,
        type: 'TENANT_SCREENING_CONSENT',
        meta: { appId, screeningId: screening.id, provider }
      });

      await prisma.tenantScreeningConsent.create({
        data: { screeningId: screening.id, appId, tenantEmail: application.email }
      });
    }
  } catch (e) {
    console.error('screening request notify error', (e as any)?.message || e);
  }

  return res.status(200).json({ ok: true, screening });
}
