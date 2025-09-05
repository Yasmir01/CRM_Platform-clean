import React from 'react';

export default function TenantCheckoutPage() {
  const [gateways, setGateways] = React.useState<any[]>([]);
  const [selectedGateway, setSelectedGateway] = React.useState<string>('');
  const [amountDue, setAmountDue] = React.useState<number>(1200);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      const r = await fetch('/api/tenant/gateways', { credentials: 'include' });
      const d = await r.json();
      setGateways(Array.isArray(d) ? d : []);
    })();
  }, []);

  async function handlePay() {
    if (!selectedGateway) return;
    setLoading(true);
    try {
      const r = await fetch('/api/payments/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ tenantId: 'me', amount: amountDue, gatewayId: selectedGateway }),
      });
      const d = await r.json();
      if (d.redirectUrl) window.location.href = d.redirectUrl;
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 max-w-md mx-auto bg-white shadow rounded space-y-4">
      <h2 className="text-xl font-bold">Pay Rent</h2>
      <p className="text-gray-600">Amount Due: <span className="font-semibold">${amountDue}</span></p>

      <div className="flex flex-col gap-2">
        <label className="text-sm text-gray-600">Payment Method</label>
        <select className="border rounded p-2" value={selectedGateway} onChange={(e) => setSelectedGateway(e.target.value)}>
          <option value="">Select a payment method</option>
          {gateways.map((g) => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>
      </div>

      <button className="bg-blue-600 text-white rounded px-3 py-2 w-full" disabled={!selectedGateway || loading} onClick={handlePay}>
        {loading ? 'Processing…' : 'Pay Now'}
      </button>
    </div>
  );
}
