import crypto from 'crypto';
import { prisma } from '../../../_db';
import { logSyncEvent } from '../../../../src/services/accounting/logService';
import { fetchQuickBooksEntity } from '../../../../src/services/accounting/quickbooksService';
import { fetchXeroEntity } from '../../../../src/services/accounting/xeroService';

export const config = { api: { bodyParser: false } } as any;

export default async function handler(req: VercelRequest & { rawBody?: Buffer }, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  const provider = String((req.query as any).provider || '').toLowerCase();

  const chunks: Buffer[] = [];
  await new Promise<void>((resolve) => {
    (req as any).on('data', (chunk: Buffer) => chunks.push(chunk));
    (req as any).on('end', () => resolve());
  });
  const buf = Buffer.concat(chunks);
  const raw = buf.toString('utf8');

  try {
    if (provider === 'quickbooks' || provider === 'qb' || provider === 'quickbooksonline') {
      const secret = process.env.QB_WEBHOOK_SECRET || process.env.QB_WEBHOOK_TOKEN;
      if (!secret) return res.status(400).send('QuickBooks webhook not configured');
      const signature = String(req.headers['intuit-signature'] || '');
      const expected = crypto.createHmac('sha256', secret).update(raw).digest('base64');
      if (signature !== expected) return res.status(401).send('Invalid signature');

      const payload = JSON.parse(raw || '{}');
      const events: any[] = payload.eventNotifications || [];
      for (const evt of events) {
        const realmId: string | undefined = evt.realmId || evt.companyId || undefined;
        const conn = realmId ? await prisma.accountingConnection.findFirst({ where: { realmId } }) : null;
        const orgId = conn?.orgId || null;
        await logSyncEvent({ orgId, provider: 'quickbooks', source: 'webhook', data: evt, status: 'received', entity: 'qb_event' });
        const entities: any[] = evt?.dataChangeEvent?.entities || [];
        for (const ent of entities) {
          if (orgId && realmId && ent?.name && ent?.id) {
            try {
              await fetchQuickBooksEntity(orgId, realmId, String(ent.name), String(ent.id));
            } catch (e: any) {
              await logSyncEvent({ orgId, provider: 'quickbooks', source: 'webhook', data: { error: e?.message || String(e), entity: ent }, status: 'failed', entity: 'qb_target_fetch', message: e?.message || 'fetch_failed' });
            }
          }
        }
      }
      return res.status(200).send('ok');
    }

    if (provider === 'xero') {
      const key = process.env.XERO_WEBHOOK_KEY;
      if (!key) return res.status(400).send('Xero webhook not configured');
      const signature = String(req.headers['x-xero-signature'] || '');
      const expected = crypto.createHmac('sha256', key).update(raw).digest('base64');
      if (signature !== expected) return res.status(401).send('Invalid signature');

      const payload = JSON.parse(raw || '{}');
      const events: any[] = payload.events || [];
      const tenantId: string | undefined = events[0]?.tenantId || undefined;
      const conn = tenantId ? await prisma.accountingConnection.findFirst({ where: { realmId: tenantId } }) : null;
      const orgId = conn?.orgId || null;
      for (const evt of events) {
        await logSyncEvent({ orgId, provider: 'xero', source: 'webhook', data: evt, status: 'received', entity: 'xero_event' });
        if (orgId && evt?.tenantId && evt?.resourceType && evt?.resourceId) {
          try {
            await fetchXeroEntity(orgId, String(evt.tenantId), String(evt.resourceType), String(evt.resourceId));
          } catch (e: any) {
            await logSyncEvent({ orgId, provider: 'xero', source: 'webhook', data: { error: e?.message || String(e), event: evt }, status: 'failed', entity: 'xero_target_fetch', message: e?.message || 'fetch_failed' });
          }
        }
      }
      return res.status(200).send('ok');
    }

    return res.status(404).send('Unknown provider');
  } catch (err: any) {
    console.error('accounting webhook error', err?.message || err);
    return res.status(500).send('error');
  }
}
