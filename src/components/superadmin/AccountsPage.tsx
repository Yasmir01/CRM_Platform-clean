import React, { useEffect, useState } from 'react';

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/super-admin/accounts', { credentials: 'include' });
        if (!res.ok) throw new Error('Failed');
        const json = await res.json();
        if (mounted) setAccounts(json || []);
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  async function updatePlan(id: string, plan: string) {
    try {
      const res = await fetch(`/api/super-admin/accounts/${id}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ plan }) });
      if (!res.ok) throw new Error('Failed to update');
      const updated = await res.json();
      setAccounts((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      alert('Plan updated ✅');
    } catch (e) {
      console.error(e);
      alert('Failed to update plan');
    }
  }

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Manage Subscriber Plans</h1>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 border">Company</th>
            <th className="p-2 border">Plan</th>
            <th className="p-2 border">Change</th>
          </tr>
        </thead>
        <tbody>
          {accounts.map((acc) => (
            <tr key={acc.id}>
              <td className="border p-2">{acc.name}</td>
              <td className="border p-2">{acc.plan}</td>
              <td className="border p-2">
                <select value={acc.plan} onChange={(e) => updatePlan(acc.id, e.target.value)} className="border rounded px-2 py-1">
                  <option value="FREE">FREE</option>
                  <option value="PRO">PRO</option>
                  <option value="ENTERPRISE">ENTERPRISE</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
