import { NextResponse } from 'next/server';

export async function GET() {
  const contacts = [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '+1 555-1234',
      company: { id: 'c1', name: 'Acme Corp' },
      owner: { id: 'u1', email: 'admin@crm.com' },
    },
    {
      id: '2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@beta.com',
      phone: '+1 555-5678',
      company: { id: 'c2', name: 'Beta Properties' },
      owner: { id: 'u2', email: 'sales@crm.com' },
    },
  ];

  return NextResponse.json(contacts);
}
