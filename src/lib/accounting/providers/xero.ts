export async function syncToXero(creds: any, ledger: { payments: any[]; expenses: any[] }) {
  const { accessToken, tenantId } = creds;
  if (!accessToken || !tenantId) throw new Error('Missing Xero credentials');

  const headers = {
    Authorization: `Bearer ${accessToken}`,
    'Xero-tenant-id': tenantId,
    'Content-Type': 'application/json',
  } as Record<string, string>;

  for (const payment of ledger.payments) {
    const payload = {
      Type: 'ACCREC',
      Contact: { Name: 'Tenant Payment' },
      Date: payment.date,
      LineItems: [{ Description: payment.type, Quantity: 1, UnitAmount: payment.amount }],
    };
    await fetch('https://api.xero.com/api.xro/2.0/Invoices', { method: 'POST', headers, body: JSON.stringify(payload) });
  }

  for (const expense of ledger.expenses) {
    const payload = {
      Type: 'ACCPAY',
      Contact: { Name: 'Property Expense' },
      Date: expense.date,
      LineItems: [{ Description: expense.category, Quantity: 1, UnitAmount: expense.amount }],
    };
    await fetch('https://api.xero.com/api.xro/2.0/Invoices', { method: 'POST', headers, body: JSON.stringify(payload) });
  }

  return { ok: true };
}
