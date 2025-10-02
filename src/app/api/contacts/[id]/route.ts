import { NextResponse } from 'next/server';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const contact = await prisma.contact.findUnique({
      where: { id },
      include: { company: true, notes: { orderBy: { createdAt: 'desc' } }, owner: true },
    });
    if (!contact) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(contact);
  } catch (e: any) {
    console.error('GET /api/contacts/[id] error', e?.message || e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const updates: any = {};
    if (body.name !== undefined) {
      const [f, ...rest] = String(body.name).split(' ');
      updates.firstName = f || '';
      updates.lastName = rest.join(' ');
    }
    if (body.firstName !== undefined) updates.firstName = body.firstName;
    if (body.lastName !== undefined) updates.lastName = body.lastName;
    if (body.email !== undefined) updates.email = body.email;
    if (body.phone !== undefined) updates.phone = body.phone;
    if (body.ownerId !== undefined) updates.ownerId = body.ownerId;
    if (body.companyId !== undefined) updates.companyId = body.companyId;

    // Require firstName and email
    if (!updates.firstName || !updates.email) {
      return NextResponse.json({ error: 'firstName and email are required' }, { status: 400 });
    }

    // Prevent duplicate email excluding self
    const duplicate = await prisma.contact.findFirst({ where: { email: { equals: updates.email, mode: 'insensitive' }, NOT: { id } } });
    if (duplicate) {
      return NextResponse.json({ error: 'Another contact with this email already exists' }, { status: 409 });
    }

    // Validate company existence if provided
    if (updates.companyId) {
      const company = await prisma.company.findUnique({ where: { id: String(updates.companyId) } });
      if (!company) return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    const updated = await prisma.contact.update({ where: { id }, data: updates });
    return NextResponse.json(updated);
  } catch (e: any) {
    console.error('PATCH /api/contacts/[id] error', e?.message || e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

async function isSuperAdmin(req: Request): Promise<boolean> {
  try {
    const role = req.headers.get('x-user-role');
    return String(role || '').toUpperCase() === 'SA';
  } catch {
    return false;
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const contact = await prisma.contact.findUnique({ where: { id }, include: { company: true, deals: true, tasks: true } as any });
    if (!contact) return NextResponse.json({ error: 'Contact not found' }, { status: 404 });

    // determine orgId from company if present
    const orgId = contact.company?.orgId || null;
    let allowOverride = false;
    if (orgId) {
      const settings = await prisma.orgSettings.findUnique({ where: { orgId } });
      allowOverride = Boolean(settings?.allowSADeletes);
    }

    const hasActiveRelations = (contact as any).deals?.length > 0 || (contact as any).tasks?.length > 0;
    if (hasActiveRelations) {
      const superAdmin = await isSuperAdmin(req);
      if (!superAdmin || !allowOverride) {
        return NextResponse.json({ error: 'Cannot delete contact with active deals or tasks (SA override not allowed)' }, { status: 403 });
      }
      // SA override: delete related deals and tasks if exist
      await prisma.deal.deleteMany({ where: { contactId: id } }).catch(() => {});
      await prisma.task.deleteMany({ where: { contactId: id } }).catch(() => {});
    }

    await prisma.contact.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error('DELETE /api/contacts/[id] error', e?.message || e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
