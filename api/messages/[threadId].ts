import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_db';
import { getUserOr401 } from '../../src/utils/authz';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = getUserOr401(req, res);
  if (!user) return;
  const userId = String((user as any).sub || (user as any).id);
  const threadId = String((req.query as any)?.threadId || '');
  if (!threadId) return res.status(400).json({ error: 'Missing threadId' });

  // Ensure user is a participant
  const isParticipant = await prisma.messageParticipant.count({ where: { threadId, userId } });
  if (!isParticipant) return res.status(403).json({ error: 'Forbidden' });

  if (req.method === 'GET') {
    try {
      const messages = await prisma.message.findMany({
        where: { threadId },
        include: { sender: true },
        orderBy: { createdAt: 'asc' },
        take: 500,
      });
      return res.status(200).json(messages);
    } catch (e: any) {
      console.error('thread messages error', e?.message || e);
      return res.status(500).json({ error: 'failed' });
    }
  }

  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const text = String(body.body || '').trim();
      if (!text) return res.status(400).json({ error: 'Missing body' });

      const message = await prisma.message.create({ data: { threadId, senderId: userId, body: text } });
      const thread = await prisma.messageThread.update({ where: { id: threadId }, data: { updatedAt: new Date() } });

      // Notify other participants
      try {
        const participants = await prisma.messageParticipant.findMany({
          where: { threadId, userId: { not: userId } },
          include: { user: true },
        });

        // In-app notification for each
        for (const p of participants) {
          try {
            await prisma.messageNotification.create({
              data: { messageId: message.id, userId: p.userId, type: 'inapp', status: 'unread' },
            });
          } catch {}

          // Email notification if SMTP configured
          try {
            const email = (p.user as any)?.email as string | undefined;
            if (email && process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
              const { sendHtmlMail } = await import('../../src/lib/mailer');
              await sendHtmlMail([email], `New Message in ${thread.subject}`, `<p>New message:</p><p>${text}</p>`);
              await prisma.messageNotification.create({ data: { messageId: message.id, userId: p.userId, type: 'email', status: 'sent' } });
            }
          } catch (e) {
            try {
              await prisma.messageNotification.create({ data: { messageId: message.id, userId: p.userId, type: 'email', status: 'failed' } });
            } catch {}
          }

          // SMS notification if Twilio configured
          try {
            const phone = (p.user as any)?.phone as string | undefined;
            if (phone && process.env.TWILIO_SID && process.env.TWILIO_TOKEN && process.env.TWILIO_FROM) {
              const { sendSMS } = await import('../../src/lib/sms');
              const preview = text.length > 100 ? text.slice(0, 100) + '…' : text;
              await sendSMS(phone, `New message: ${preview}`);
              await prisma.messageNotification.create({ data: { messageId: message.id, userId: p.userId, type: 'sms', status: 'sent' } });
            }
          } catch (e) {
            try {
              await prisma.messageNotification.create({ data: { messageId: message.id, userId: p.userId, type: 'sms', status: 'failed' } });
            } catch {}
          }
        }
      } catch (e) {
        console.error('message notify error', (e as any)?.message || e);
      }

      return res.status(200).json(message);
    } catch (e: any) {
      console.error('thread post error', e?.message || e);
      return res.status(500).json({ error: 'failed' });
    }
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'Method Not Allowed' });
}
