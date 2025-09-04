import React from 'react';

type Gateway = { id: string; name: string; enabled: boolean; config?: any; propertyId?: string | null; subscriptionPlanId?: string | null; global?: boolean };

export default function GatewayManagement() {
  const [gateways, setGateways] = React.useState<Gateway[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [selected, setSelected] = React.useState<Gateway | null>(null);
  const [config, setConfig] = React.useState<any>({});

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

  async function saveConfig() {
    if (!selected) return;
    await fetch('/api/payment-gateways/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ id: selected.id, config }),
    });
    setSelected(null);
    setConfig({});
    load();
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
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {gateways.map((g) => (
              <tr key={g.id} className="border-b">
                <td className="p-2">{g.name}</td>
                <td className="p-2">{g.global ? 'Global' : g.subscriptionPlanId ? `Plan: ${g.subscriptionPlanId}` : g.propertyId ? `Property: ${g.propertyId}` : 'Unassigned'}</td>
                <td className="p-2">
                  <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                    <input type="checkbox" checked={!!g.enabled} onChange={(e) => toggleGateway(g.id, e.target.checked)} />
                    <span>{g.enabled ? 'On' : 'Off'}</span>
                  </label>
                </td>
                <td className="p-2">
                  <button
                    className="border rounded px-2 py-1"
                    onClick={() => { setSelected(g); setConfig(g.config || {}); }}
                  >
                    Edit Config
                  </button>
                </td>
              </tr>
            ))}
            {gateways.length === 0 && !loading && (
              <tr>
                <td className="p-3 text-center text-gray-500" colSpan={4}>No gateways configured</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg w-full max-w-md p-4">
            <div className="mb-3">
              <h3 className="text-lg font-semibold">Edit {selected?.name} Configuration</h3>
            </div>
            <div className="space-y-3">
              <input
                className="border rounded p-2 w-full"
                placeholder="API Key"
                value={config.apiKey || ''}
                onChange={(e) => setConfig((c: any) => ({ ...c, apiKey: e.target.value }))}
              />
              <input
                className="border rounded p-2 w-full"
                placeholder="Secret"
                type="password"
                value={config.secret || ''}
                onChange={(e) => setConfig((c: any) => ({ ...c, secret: e.target.value }))}
              />
              <input
                className="border rounded p-2 w-full"
                placeholder="Webhook URL"
                value={config.webhookUrl || ''}
                onChange={(e) => setConfig((c: any) => ({ ...c, webhookUrl: e.target.value }))}
              />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button className="border rounded px-3 py-2" onClick={() => { setSelected(null); setConfig({}); }}>Cancel</button>
              <button className="bg-blue-600 text-white rounded px-3 py-2" onClick={saveConfig}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
