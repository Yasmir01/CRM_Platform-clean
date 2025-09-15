import { NextResponse } from 'next/server';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const contacts = await prisma.contact.findMany({
      include: { company: true, owner: true },
      orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
      take: 100,
    });
    // map to name for frontend convenience
    const mapped = contacts.map((c) => ({
      ...c,
      name: `${c.firstName || ''} ${c.lastName || ''}`.trim(),
    }));
    return NextResponse.json(mapped);
  } catch (e: any) {
    console.error('GET /api/contacts error', e?.message || e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    // Accept either name or firstName/lastName
    let firstName = data.firstName;
    let lastName = data.lastName;
    if (!firstName && data.name) {
      const [f, ...rest] = String(data.name).split(' ');
      firstName = f;
      lastName = rest.join(' ');
    }

    const email = data.email ? String(data.email).trim() : '';
    if (!firstName || !email) {
      return NextResponse.json({ error: 'firstName and email are required' }, { status: 400 });
    }

    // Duplicate email check (case-insensitive)
    const existing = await prisma.contact.findFirst({ where: { email: { equals: email, mode: 'insensitive' } } });
    if (existing) {
      return NextResponse.json({ error: 'Contact with this email already exists' }, { status: 409 });
    }

    // Check company exists if provided
    const companyId = data.companyId || null;
    if (companyId) {
      const company = await prisma.company.findUnique({ where: { id: String(companyId) } });
      if (!company) {
        return NextResponse.json({ error: 'Company not found' }, { status: 404 });
      }
    }

    const contact = await prisma.contact.create({
      data: {
        firstName: String(firstName || ''),
        lastName: String(lastName || ''),
        email: email,
        phone: data.phone || null,
        position: data.position || null,
        companyId: companyId,
        ownerId: data.ownerId || null,
      },
      include: { company: true, owner: true },
    });
    const mapped = { ...contact, name: `${contact.firstName} ${contact.lastName}`.trim() };
    return NextResponse.json(mapped, { status: 201 });
  } catch (e: any) {
    console.error('POST /api/contacts error', e?.message || e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
