import React from 'react';

export default function AutoPaySetupPage() {
  const [gateways, setGateways] = React.useState<any[]>([]);
  const [gatewayId, setGatewayId] = React.useState<string>('');
  const [amountType, setAmountType] = React.useState<string>('FULL_RENT');
  const [amountValue, setAmountValue] = React.useState<number | ''>('');
  const [dayOfMonth, setDayOfMonth] = React.useState<number>(1);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    fetch('/api/tenant/gateways', { credentials: 'include' })
      .then((r) => r.json())
      .then(setGateways);
  }, []);

  async function handleSave() {
    if (!gatewayId) return;
    setSaving(true);
    try {
      await fetch('/api/autopay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          propertyId: null,
          gatewayId,
          methodId: 'pm_default',
          amountType,
          amountValue: amountType === 'FULL_RENT' ? null : Number(amountValue || 0),
          dayOfMonth,
        }),
      });
      alert('AutoPay saved!');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-4 max-w-md mx-auto bg-white shadow rounded space-y-4">
      <h2 className="text-xl font-bold">Setup AutoPay</h2>

      <div className="flex flex-col gap-2">
        <label className="text-sm text-gray-600">Payment Gateway</label>
        <select className="border rounded p-2" value={gatewayId} onChange={(e) => setGatewayId(e.target.value)}>
          <option value="">Select Payment Gateway</option>
          {gateways.map((g) => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm text-gray-600">Payment Type</label>
        <select className="border rounded p-2" value={amountType} onChange={(e) => setAmountType(e.target.value)}>
          <option value="FULL_RENT">Full Rent</option>
          <option value="FIXED">Fixed Amount</option>
          <option value="PERCENTAGE">Percentage of Rent</option>
        </select>
      </div>

      {amountType !== 'FULL_RENT' && (
        <input
          type="number"
          className="border rounded p-2 w-full"
          placeholder="Enter amount or %"
          value={amountValue}
          onChange={(e) => setAmountValue(e.target.value === '' ? '' : Number(e.target.value))}
        />
      )}

      <div className="flex flex-col gap-2">
        <label className="text-sm text-gray-600">Day of Month</label>
        <input type="number" className="border rounded p-2" value={dayOfMonth} onChange={(e) => setDayOfMonth(parseInt(e.target.value || '1'))} />
      </div>

      <button className="bg-blue-600 text-white rounded px-3 py-2 w-full" disabled={!gatewayId || saving} onClick={handleSave}>
        {saving ? 'Saving…' : 'Save AutoPay'}
      </button>
    </div>
  );
}
