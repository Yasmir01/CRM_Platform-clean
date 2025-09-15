import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const contacts = await prisma.contact.findMany({
      include: { company: true, owner: true },
      orderBy: { updatedAt: 'desc' },
      take: 100,
    });
    return NextResponse.json(contacts);
  } catch (e: any) {
    console.error('GET /api/contacts error', e?.message || e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const contact = await prisma.contact.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        position: data.position,
        companyId: data.companyId || null,
        ownerId: data.ownerId || null,
      },
      include: { company: true, owner: true },
    });
    return NextResponse.json(contact, { status: 201 });
  } catch (e: any) {
    console.error('POST /api/contacts error', e?.message || e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
