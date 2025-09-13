import { prisma } from '../../../../../api/_db';

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

    return new Response(JSON.stringify({ success: true, lead }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error saving lead:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
