import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as docusign from 'docusign-esign';
import { getUserOr401 } from '../../src/utils/authz';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');
  const user = getUserOr401(req, res);
  if (!user) return;

  try {
    const { leaseId, signerEmail, signerName, docUrl } = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    if (!signerEmail || !signerName || !docUrl) return res.status(400).json({ error: 'missing fields' });

    const accessToken = process.env.DOCUSIGN_ACCESS_TOKEN as string | undefined;
    if (!accessToken) return res.status(500).json({ error: 'DOCUSIGN_ACCESS_TOKEN not set' });

    const dsApiClient = new docusign.ApiClient();
    dsApiClient.setBasePath(process.env.DOCUSIGN_BASE_URL || 'https://demo.docusign.net/restapi');
    dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + accessToken);

    const envelopesApi = new docusign.EnvelopesApi(dsApiClient);

    const docBytes = await fetch(docUrl).then(r => r.arrayBuffer());
    const base64Doc = Buffer.from(docBytes).toString('base64');

    const document = new docusign.Document();
    document.documentBase64 = base64Doc;
    document.name = 'Lease Agreement';
    document.fileExtension = 'pdf';
    document.documentId = '1';

    const signer = docusign.Signer.constructFromObject({
      email: signerEmail,
      name: signerName,
      recipientId: '1',
      routingOrder: '1',
      clientUserId: signerEmail,
    });

    const signHere = docusign.SignHere.constructFromObject({
      anchorString: '/sig1/',
      anchorUnits: 'pixels',
      anchorXOffset: '0',
      anchorYOffset: '0',
    });

    const tabs = docusign.Tabs.constructFromObject({ signHereTabs: [signHere] });
    (signer as any).tabs = tabs;

    const envelopeDefinition = new docusign.EnvelopeDefinition();
    envelopeDefinition.emailSubject = 'Please sign your lease';
    (envelopeDefinition as any).documents = [document];
    (envelopeDefinition as any).recipients = docusign.Recipients.constructFromObject({ signers: [signer] });
    envelopeDefinition.status = 'sent';

    const accountId = process.env.DOCUSIGN_ACCOUNT_ID as string | undefined;
    if (!accountId) return res.status(500).json({ error: 'DOCUSIGN_ACCOUNT_ID not set' });

    const results = await envelopesApi.createEnvelope(accountId, { envelopeDefinition });
    return res.status(200).json({ ok: true, envelopeId: (results as any).envelopeId });
  } catch (e: any) {
    console.error('DocuSign create-envelope error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
