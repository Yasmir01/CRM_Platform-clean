export async function syncToQuickBooks(creds: any, ledger: { payments: any[]; expenses: any[] }) {
  const { accessToken, realmId } = creds;
  if (!accessToken || !realmId) throw new Error('Missing QuickBooks credentials');

  const base = `https://quickbooks.api.intuit.com/v3/company/${encodeURIComponent(realmId)}`;
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  } as Record<string, string>;

  for (const payment of ledger.payments) {
    const payload = {
      Line: [
        {
          Amount: payment.amount,
          DetailType: 'SalesItemLineDetail',
          SalesItemLineDetail: { ItemRef: { value: '1', name: payment.type } },
        },
      ],
      TxnDate: payment.date,
    };
    await fetch(`${base}/salesreceipt`, { method: 'POST', headers, body: JSON.stringify(payload) });
  }

  for (const expense of ledger.expenses) {
    const payload = {
      Line: [
        { Amount: expense.amount, DetailType: 'AccountBasedExpenseLineDetail' },
      ],
      TxnDate: expense.date,
    };
    await fetch(`${base}/bill`, { method: 'POST', headers, body: JSON.stringify(payload) });
  }

  return { ok: true };
}
