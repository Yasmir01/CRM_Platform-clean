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

    // Require firstName and email
    if (!updates.firstName || !updates.email) {
      return NextResponse.json({ error: 'firstName and email are required' }, { status: 400 });
    }

    // Prevent duplicate email excluding self
    const duplicate = await prisma.contact.findFirst({ where: { email: { equals: updates.email, mode: 'insensitive' }, NOT: { id } } });
    if (duplicate) {
      return NextResponse.json({ error: 'Another contact with this email already exists' }, { status: 409 });
    }

    const updated = await prisma.contact.update({ where: { id }, data: updates });
    return NextResponse.json(updated);
  } catch (e: any) {
    console.error('PATCH /api/contacts/[id] error', e?.message || e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    await prisma.contact.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error('DELETE /api/contacts/[id] error', e?.message || e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
