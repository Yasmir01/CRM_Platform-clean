import { NextResponse } from 'next/server';

export async function GET() {
  const companies = [
    {
      id: 'c1',
      name: 'Acme Corp',
      domain: 'acme.com',
      industry: 'Real Estate',
      _count: { contacts: 3 },
    },
    {
      id: 'c2',
      name: 'Beta Properties',
      domain: 'betaproperties.com',
      industry: 'Property Management',
      _count: { contacts: 5 },
    },
  ];

  return NextResponse.json(companies);
}
