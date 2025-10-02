import { NextResponse } from 'next/server';

export async function GET() {
  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      price: 29,
      billingCycle: 'monthly',
      features: [
        { id: 'f-basic-crm', featureKey: 'basic-crm', enabled: true },
        { id: 'f-email-support', featureKey: 'email-support', enabled: true },
        { id: 'f-analytics', featureKey: 'advanced-analytics', enabled: false },
        { id: 'f-api', featureKey: 'api-access', enabled: false },
      ],
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 99,
      billingCycle: 'monthly',
      features: [
        { id: 'f-basic-crm', featureKey: 'basic-crm', enabled: true },
        { id: 'f-email-support', featureKey: 'email-support', enabled: true },
        { id: 'f-analytics', featureKey: 'advanced-analytics', enabled: true },
        { id: 'f-api', featureKey: 'api-access', enabled: true },
        { id: 'f-priority', featureKey: 'priority-support', enabled: true },
      ],
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 299,
      billingCycle: 'monthly',
      features: [
        { id: 'f-basic-crm', featureKey: 'basic-crm', enabled: true },
        { id: 'f-email-support', featureKey: 'email-support', enabled: true },
        { id: 'f-analytics', featureKey: 'advanced-analytics', enabled: true },
        { id: 'f-api', featureKey: 'api-access', enabled: true },
        { id: 'f-priority', featureKey: 'priority-support', enabled: true },
        { id: 'f-sso', featureKey: 'sso-saml', enabled: true },
        { id: 'f-multi', featureKey: 'multi-tenant', enabled: true },
      ],
    },
  ];

  return NextResponse.json(plans);
}
