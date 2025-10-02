import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const company = await prisma.company.findUnique({
      where: { id },
      include: { contacts: { orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }] } },
    });
    if (!company) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const mapped = {
      ...company,
      contacts: (company.contacts || []).map((ct) => ({ id: ct.id, name: `${ct.firstName || ''} ${ct.lastName || ''}`.trim() })),
    };
    return NextResponse.json(mapped);
  } catch (e: any) {
    console.error('GET /api/companies/[id] error', e?.message || e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const data = await req.json();
    const name = String(data.name || '').trim();
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    // Prevent duplicate name (excluding current)
    const duplicate = await prisma.company.findFirst({ where: { name: { equals: name, mode: 'insensitive' }, NOT: { id } } });
    if (duplicate) {
      return NextResponse.json({ error: 'Another company with this name already exists' }, { status: 409 });
    }

    const updated = await prisma.company.update({
      where: { id },
      data: { name, industry: data.industry || null, website: data.website || data.domain || null },
    });
    return NextResponse.json(updated);
  } catch (e: any) {
    console.error('PATCH /api/companies/[id] error', e?.message || e);
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
    const company = await prisma.company.findUnique({ where: { id }, include: { contacts: true, organization: true } });
    if (!company) return NextResponse.json({ error: 'Company not found' }, { status: 404 });

    // fetch org settings if available
    let allowOverride = false;
    if (company.orgId) {
      const settings = await prisma.orgSettings.findUnique({ where: { orgId: company.orgId } });
      allowOverride = Boolean(settings?.allowSADeletes);
    }

    if ((company.contacts || []).length > 0) {
      const superAdmin = await isSuperAdmin(req);
      if (!superAdmin || !allowOverride) {
        return NextResponse.json({ error: 'Cannot delete company with active contacts (SA override not allowed)' }, { status: 403 });
      }

      // SA override: delete contacts first
      await prisma.contact.deleteMany({ where: { companyId: id } });
    }

    await prisma.company.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error('DELETE /api/companies/[id] error', e?.message || e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
