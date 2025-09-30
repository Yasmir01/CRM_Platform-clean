import { NextResponse } from 'next/server';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const companies = await prisma.company.findMany({
      include: { contacts: true },
      orderBy: { createdAt: 'desc' },
    });
    // map contacts to name for frontend
    const mapped = companies.map((c) => ({
      ...c,
      contacts: (c.contacts || []).map((ct) => ({ id: ct.id, name: `${ct.firstName || ''} ${ct.lastName || ''}`.trim() })),
    }));
    return NextResponse.json(mapped);
  } catch (e: any) {
    console.error('GET /api/companies error', e?.message || e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const name = String(data.name || '').trim();
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    // Check for duplicates (case-insensitive)
    const existing = await prisma.company.findFirst({ where: { name: { equals: name, mode: 'insensitive' } } });
    if (existing) {
      return NextResponse.json({ error: 'Company with this name already exists' }, { status: 409 });
    }

    const company = await prisma.company.create({
      data: {
        name,
        industry: data.industry || null,
        website: data.website || data.domain || null,
      },
    });
    return NextResponse.json(company, { status: 201 });
  } catch (e: any) {
    console.error('POST /api/companies error', e?.message || e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
