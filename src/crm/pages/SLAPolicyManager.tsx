import * as React from 'react';

export default function SLAPolicyManager() {
  const [policies, setPolicies] = React.useState<any[]>([]);
  const [category, setCategory] = React.useState('');
  const [hours, setHours] = React.useState('');
  const [propertyId, setPropertyId] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  const load = React.useCallback(async () => {
    const r = await fetch('/api/sla/policies', { credentials: 'include' });
    const d = await r.json();
    setPolicies(Array.isArray(d) ? d : []);
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const savePolicy = async () => {
    if (!category || !hours) return;
    setSaving(true);
    try {
      const res = await fetch('/api/sla/policy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ category, hours: Number(hours), propertyId: propertyId || null }),
      });
      if (res.ok) {
        setCategory('');
        setHours('');
        setPropertyId('');
        load();
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 bg-white shadow rounded space-y-4">
      <h2 className="text-lg font-bold">SLA Policy Manager</h2>

      <div className="flex flex-col sm:flex-row gap-2">
        <input
          placeholder="Category"
          className="border p-2 rounded"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
        <input
          placeholder="Hours"
          type="number"
          className="border p-2 rounded"
          value={hours}
          onChange={(e) => setHours(e.target.value)}
        />
        <input
          placeholder="Property ID (optional)"
          className="border p-2 rounded"
          value={propertyId}
          onChange={(e) => setPropertyId(e.target.value)}
        />
        <button onClick={savePolicy} disabled={saving} className="bg-blue-600 text-white px-3 py-2 rounded">
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>

      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="border p-2">Category</th>
            <th className="border p-2">Hours</th>
            <th className="border p-2">Property</th>
          </tr>
        </thead>
        <tbody>
          {policies.map((p) => (
            <tr key={p.id}>
              <td className="border p-2">{p.category}</td>
              <td className="border p-2">{p.hours}h</td>
              <td className="border p-2">{p.property?.address || 'Global Default'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
