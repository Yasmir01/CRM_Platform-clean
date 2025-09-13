import { prisma } from '../../../../../api/_db';
import { prisma } from '../../../../../api/_db';
import { withAuthorization } from '../../../../lib/authz';
import { sendEmail } from '../../../../lib/mailer';
import { sendSMS } from '../../../../lib/sms';

export const GET = withAuthorization('lead:read', async (req: Request) => {
  const leads = await prisma.lead.findMany({
    include: { landingPage: { include: { property: true } } },
    orderBy: { createdAt: 'desc' },
  });
  return new Response(JSON.stringify(leads), { headers: { 'Content-Type': 'application/json' } });
});

export async function POST(req: Request) {
  try {
    const data = await req.json();

    if (!data || !data.name || !data.email || !data.landingPageId) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const lead = await prisma.lead.create({
      data: {
        landingPageId: data.landingPageId,
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        message: data.message || null,
      },
    });

    // Fire-and-forget: notify subscriber(s) via email and SMS when possible
    try {
      // Try to find landing page and related property/account/users
      const lp = await prisma.propertyLandingPage.findUnique({
        where: { id: data.landingPageId },
        include: { property: true, subscriber: true },
      });

      let notifyEmails: string[] = [];
      let notifyPhones: string[] = [];

      if (lp) {
        const accountId = (lp as any).companyId || lp.property?.accountId || null;
        if (accountId) {
          const users = await prisma.user.findMany({ where: { accountId }, select: { email: true, phone: true } });
          notifyEmails = users.map((u) => u.email).filter(Boolean);
          notifyPhones = users.map((u) => u.phone).filter(Boolean);
        }
      }

      // Fallback to env email
      if (notifyEmails.length === 0 && process.env.EMAIL_FROM) notifyEmails = [process.env.EMAIL_FROM];

      const emailText = `You have a new lead:\nName: ${lead.name}\nEmail: ${lead.email}\nPhone: ${lead.phone || 'N/A'}\nMessage: ${lead.message || ''}`;

      if (notifyEmails.length > 0) {
        // send in background
        sendEmail({ to: notifyEmails, subject: `New lead for ${lp?.property?.name || 'your property'}`, text: emailText }).catch((e: any) => console.error('Failed to send lead email', e));
      }

      if (notifyPhones.length > 0) {
        for (const p of notifyPhones) {
          sendSMS(p, `New lead: ${lead.name} (${lead.email}) for ${lp?.property?.name || 'your property'}`).catch((e: any) => console.error('Failed to send lead SMS', e));
        }
      }
    } catch (notifErr) {
      // do not fail lead creation if notifications fail
      // eslint-disable-next-line no-console
      console.warn('Lead created but notification failed or not configured', notifErr);
    }

    return new Response(JSON.stringify({ success: true, lead }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error saving lead:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
