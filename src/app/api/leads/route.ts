import { prisma } from '../../../../../api/_db';
import { withAuthorization } from '../../../../lib/authz';
import { sendEmail } from '../../../../lib/mailer';
import { sendSMS } from '../../../../lib/sms';
import { canUseFeature } from '../../../../lib/planRules';

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
      const lp = await prisma.landingPage.findUnique({
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

      // Determine subscriber-level contacts and settings
      const subscriber: any = lp?.subscriber || null;
      const subscriberEmail = subscriber?.email || (notifyEmails.length > 0 ? notifyEmails[0] : null);
      const subscriberPhone = subscriber?.phone || (notifyPhones.length > 0 ? notifyPhones[0] : null);

      // Check plan rules and admin overrides
      const canUseEmail = (plan: any) => canUseFeature(plan, 'email');
      const canUseSMS = (plan: any) => canUseFeature(plan, 'sms');

      // Email: subscriber must want email, admin must allow, and plan must permit
      if (
        subscriberEmail &&
        (subscriber?.notifyEmail ?? true) &&
        (subscriber?.emailEnabledByAdmin ?? true) &&
        canUseEmail(subscriber?.plan)
      ) {
        sendEmail({ to: subscriberEmail, subject: `New lead for ${lp?.property?.name || 'your property'}`, text: emailText }).catch((e: any) => console.error('Failed to send lead email', e));
      }

      // SMS: subscriber must want SMS, admin must allow, and plan must permit
      if (
        subscriberPhone &&
        (subscriber?.notifySMS ?? false) &&
        (subscriber?.smsEnabledByAdmin ?? true) &&
        canUseSMS(subscriber?.plan)
      ) {
        sendSMS(subscriberPhone, `New lead: ${lead.name} (${lead.email}) for ${lp?.property?.name || 'your property'}`).catch((e: any) => console.error('Failed to send lead SMS', e));
      }
    } catch (notifErr) {
      // do not fail lead creation if notifications fail
      // eslint-disable-next-line no-console
      console.warn('Lead created but notification failed or not configured', notifErr);
    }

    // emit webhooks for lead.created
    try {
      const { emitWebhook } = await import('@/lib/webhooks');
      const property = await prisma.property.findUnique({ where: { id: lead.propertyId } });
      const payload = { lead, property };
      emitWebhook('lead.created', payload, (lead as any).subscriberId || undefined);
    } catch (e) {
      console.warn('emitWebhook failed for lead', e);
    }

    return new Response(JSON.stringify({ success: true, lead }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error saving lead:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
