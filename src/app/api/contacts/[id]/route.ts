import { NextResponse } from 'next/server';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  const contact = {
    id,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '+1 555-1234',
    position: 'Tenant',
    notes: [
      { id: 'n1', content: 'Called on Monday' },
      { id: 'n2', content: 'Interested in renewal' },
    ],
    company: { id: 'c1', name: 'Acme Corp' },
  };

  return NextResponse.json(contact);
}
