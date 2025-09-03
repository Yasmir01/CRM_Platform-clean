export async function syncToFreshBooks(creds: any, ledger: { payments: any[]; expenses: any[] }) {
  const { accessToken, accountId } = creds;
  if (!accessToken || !accountId) throw new Error('Missing FreshBooks credentials');

  const headers = { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' } as Record<string, string>;

  for (const payment of ledger.payments) {
    const payload = {
      invoice: {
        customerid: '123',
        create_date: payment.date,
        lines: [
          { name: payment.type, unit_cost: { amount: payment.amount, code: 'USD' }, qty: 1 },
        ],
      },
    };
    await fetch(`https://api.freshbooks.com/accounting/account/${encodeURIComponent(accountId)}/invoices/invoices`, {
      method: 'POST', headers, body: JSON.stringify(payload),
    });
  }

  for (const expense of ledger.expenses) {
    const payload = {
      expense: {
        amount: expense.amount,
        categoryid: 'maintenance',
        date: expense.date,
        notes: expense.description || expense.category,
      },
    };
    await fetch(`https://api.freshbooks.com/accounting/account/${encodeURIComponent(accountId)}/expenses/expenses`, {
      method: 'POST', headers, body: JSON.stringify(payload),
    });
  }

  return { ok: true };
}
