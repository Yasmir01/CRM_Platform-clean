import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_db';
import { generateCSV, generatePDF } from '../src/lib/export-utils';
import { sendEmail } from '../src/lib/mailer';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const exportsList = await prisma.scheduledExport.findMany({ where: { active: true }, include: { su: { select: { email: true } } } });

    for (const exp of exportsList) {
      try {
        let file: Buffer | string;
        let filename: string;

        if (exp.type === 'CSV') {
          file = await generateCSV();
          filename = 'history.csv';
        } else if (exp.type === 'PDF') {
          file = await generatePDF();
          filename = 'history.pdf';
        } else {
          console.warn('Unknown export type', exp.type);
          continue;
        }

        const to = exp.email || exp.su?.email;
        if (!to) {
          console.warn('No recipient for scheduled export', exp.id);
          continue;
        }

        await sendEmail({
          to,
          subject: `Scheduled ${exp.type} Export (${exp.frequency})`,
          text: 'Attached is your scheduled export.',
          attachments: [
            {
              filename,
              content: Buffer.isBuffer(file) ? file : Buffer.from(String(file)),
            },
          ],
        });

        console.log('Sent scheduled export', exp.id, 'to', to);
      } catch (e) {
        console.error('Failed exporting for scheduledExport', exp.id, e?.message || e);
      }
    }

    return res.status(200).json({ message: 'Scheduled exports processed' });
  } catch (err: any) {
    console.error('run-exports error', err?.message || err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
