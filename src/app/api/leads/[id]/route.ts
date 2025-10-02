<<<<<<< HEAD
import { prisma } from '../../../../../api/_db';
=======
import { prisma } from '../../../../../pages/api/_db';
>>>>>>> ac4b396533b24013bc1866988c2033005cd609c9
import { withAuthorization } from '../../../../lib/authz';

// GET a single lead
export const GET = withAuthorization('lead:read', async (_: Request, { params }: any) => {
  const lead = await prisma.lead.findUnique({
    where: { id: params.id },
    include: { landingPage: { include: { property: true } } },
  });
  return new Response(JSON.stringify(lead), { headers: { 'Content-Type': 'application/json' } });
});

// PUT update lead status
export const PUT = withAuthorization('lead:write', async (req: Request, { params }: any) => {
  const data = await req.json();
  const lead = await prisma.lead.update({ where: { id: params.id }, data: { status: data.status } });
  return new Response(JSON.stringify(lead), { headers: { 'Content-Type': 'application/json' } });
});

// Also export DELETE if needed
export const DELETE = withAuthorization('lead:write', async (_: Request, { params }: any) => {
  await prisma.lead.delete({ where: { id: params.id } });
  return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
});
