import React from 'react';

export default function GatewayManagement() {
  const [gateways, setGateways] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    const r = await fetch('/api/payment-gateways', { credentials: 'include' });
    const d = await r.json();
    setGateways(Array.isArray(d) ? d : []);
    setLoading(false);
  }, []);

  React.useEffect(() => { load(); }, [load]);

  async function toggleGateway(id: string, enabled: boolean) {
    await fetch('/api/payment-gateways', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ id, enabled }),
    });
    setGateways(prev => prev.map(g => g.id === id ? { ...g, enabled } : g));
  }

  return (
    <div className="p-4 bg-white shadow rounded">
      <h2 className="text-xl font-bold mb-4">Payment Gateway Management</h2>
      {loading && <div className="text-sm text-gray-500 mb-2">Loading…</div>}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Gateway</th>
              <th className="p-2 text-left">Scope</th>
              <th className="p-2 text-left">Enabled</th>
            </tr>
          </thead>
          <tbody>
            {gateways.map((g) => (
              <tr key={g.id} className="border-b">
                <td className="p-2">{g.name}</td>
                <td className="p-2">
                  {g.global ? 'Global' : g.subscriptionPlanId ? `Plan: ${g.subscriptionPlanId}` : g.propertyId ? `Property: ${g.propertyId}` : 'Unassigned'}
                </td>
                <td className="p-2">
                  <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                    <input type="checkbox" checked={!!g.enabled} onChange={(e) => toggleGateway(g.id, e.target.checked)} />
                    <span>{g.enabled ? 'On' : 'Off'}</span>
                  </label>
                </td>
              </tr>
            ))}
            {gateways.length === 0 && !loading && (
              <tr>
                <td className="p-3 text-center text-gray-500" colSpan={3}>No gateways configured</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
