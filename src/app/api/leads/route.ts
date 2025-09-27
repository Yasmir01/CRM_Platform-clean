import { prisma } from '../../../../../pages/api/_db';
import { withAuthorization } from '../../../../lib/authz';
import { sendEmail } from '../../../../lib/mailer';
import { sendSMS } from '../../../../lib/sms';
import { canUseFeature } from '../../../../lib/planRules';
import { withRateLimit } from '../../../../lib/withRateLimit';

export const GET = withAuthorization('lead:read', async (req: Request) => {
  const leads = await prisma.lead.findMany({
    include: { landingPage: { include: { property: true } } },
    orderBy: { createdAt: 'desc' },
  });
  return new Response(JSON.stringify(leads), { headers: { 'Content-Type': 'application/json' } });
});

async function handler(req: Request) {
  try {
    const data = await req.json();

    if (!data || !data.name || !data.email) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Verify reCAPTCHA token (if enabled)
    if (process.env.RECAPTCHA_SECRET_KEY) {
      const token = data.recaptchaToken;
      const ip = (req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '') as string;
      const { verifyRecaptcha } = await import('@/lib/recaptcha');
      const rc = await verifyRecaptcha(token, ip);
      if (!rc.success || (typeof rc.score === 'number' && rc.score < 0.4)) {
        return new Response(JSON.stringify({ error: 'Failed CAPTCHA check' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
      }
    }

    // Try to resolve landing page (if provided) so we can derive subscriber/property when missing from headers
    let lp: any = null;
    if (data.landingPageId) {
      lp = await prisma.landingPage.findUnique({ where: { id: data.landingPageId }, include: { property: true, subscriber: true } });
    }

    const headerSubscriberId = (req.headers.get('x-subscriber-id') || '') as string;
    const subscriberId = headerSubscriberId || lp?.subscriber?.id;
    if (!subscriberId) {
      return new Response(JSON.stringify({ error: 'Missing subscriberId' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const propertyId = (req.headers.get('x-property-id') || lp?.property?.id || null) as string | null;

    // ✅ Save lead into Prisma
    const lead = await prisma.lead.create({
      data: {
        propertyId: propertyId || undefined,
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        message: data.message || null,
        subscriberId,
      },
    });

    // Fire-and-forget: notify subscriber(s) via email and SMS when possible
    try {
      // Use lp if we already have it, otherwise try to derive from lead.propertyId
      let landing = lp;
      if (!landing && lead.propertyId) {
        landing = await prisma.landingPage.findFirst({ where: { propertyId: lead.propertyId }, include: { property: true, subscriber: true } });
      }

      let notifyEmails: string[] = [];
      let notifyPhones: string[] = [];

      if (landing) {
        const accountId = (landing as any).companyId || landing.property?.accountId || null;
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
      const subscriber: any = landing?.subscriber || (await prisma.subscriber.findUnique({ where: { id: subscriberId } })) || null;
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
        sendEmail({ to: subscriberEmail, subject: `New lead for ${landing?.property?.name || 'your property'}`, text: emailText }).catch((e: any) => console.error('Failed to send lead email', e));
      }

      // SMS: subscriber must want SMS, admin must allow, and plan must permit
      if (
        subscriberPhone &&
        (subscriber?.notifySMS ?? false) &&
        (subscriber?.smsEnabledByAdmin ?? true) &&
        canUseSMS(subscriber?.plan)
      ) {
        sendSMS(subscriberPhone, `New lead: ${lead.name} (${lead.email}) for ${landing?.property?.name || 'your property'}`).catch((e: any) => console.error('Failed to send lead SMS', e));
      }
    } catch (notifErr) {
      // do not fail lead creation if notifications fail
      // eslint-disable-next-line no-console
      console.warn('Lead created but notification failed or not configured', notifErr);
    }

    // emit webhooks for lead.created
    try {
      const { emitWebhook } = await import('@/lib/webhooks');
      const property = lead.propertyId ? await prisma.property.findUnique({ where: { id: lead.propertyId } }) : null;
      const payload = { lead, property };
      emitWebhook('lead.created', payload, lead.subscriberId || undefined);
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

export const POST = withRateLimit(handler, { keyPrefix: 'leads' });
