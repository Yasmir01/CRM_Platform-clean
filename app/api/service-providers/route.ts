import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET all service providers
export async function GET() {
  try {
    const providers = await prisma.serviceProvider.findMany({
      include: { company: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(providers);
  } catch (err: any) {
    console.error('GET /api/service-providers error', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// CREATE a new service provider
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, companyId } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid name' }, { status: 400 });
    }
    if (!companyId || typeof companyId !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid companyId' }, { status: 400 });
    }

    // ensure company exists
    const company = await prisma.company.findUnique({ where: { id: companyId } });
    if (!company) return NextResponse.json({ error: 'companyId does not reference an existing company' }, { status: 400 });

    const newProvider = await prisma.serviceProvider.create({
      data: { name: name.trim(), email: email || null, phone: phone || null, companyId },
      include: { company: true },
    });

    return NextResponse.json(newProvider, { status: 201 });
  } catch (err: any) {
    console.error('POST /api/service-providers error', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// UPDATE an existing service provider
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, name, email, phone, companyId } = body;

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid id' }, { status: 400 });
    }
    if (!companyId || typeof companyId !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid companyId' }, { status: 400 });
    }

    // ensure company exists
    const company = await prisma.company.findUnique({ where: { id: companyId } });
    if (!company) return NextResponse.json({ error: 'companyId does not reference an existing company' }, { status: 400 });

    const updated = await prisma.serviceProvider.update({
      where: { id },
      data: { name: name !== undefined ? String(name).trim() : undefined, email: email ?? null, phone: phone ?? null, companyId },
      include: { company: true },
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error('PUT /api/service-providers error', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE a service provider
export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { id } = body;
    if (!id || typeof id !== 'string') return NextResponse.json({ error: 'Missing or invalid id' }, { status: 400 });

    await prisma.serviceProvider.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('DELETE /api/service-providers error', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
