import React, { useEffect, useState } from 'react';

export default function AdminAutoPay() {
  const [items, setItems] = useState<any[]>([]);

  const load = async () => {
    const r = await fetch('/api/autopay/admin/list', { credentials: 'include' });
    const d = await r.json();
    setItems(Array.isArray(d) ? d : []);
  };

  useEffect(() => { load(); }, []);

  const disable = async (id: string) => {
    if (!window.confirm('Disable this AutoPay?')) return;
    await fetch('/api/autopay/admin/disable', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, active: false } : i)));
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold">AutoPay Management</h1>
      <table className="w-full border-collapse border">
        <thead><tr><th>Tenant</th><th>Lease</th><th>Amount</th><th>Day</th><th>Status</th><th /></tr></thead>
        <tbody>
          {items.map((i) => (
            <tr key={i.id} className="border text-center">
              <td>{i.tenantId}</td>
              <td>{i.leaseId}</td>
              <td>${i.amount}</td>
              <td>{i.dayOfMonth}</td>
              <td>{i.active ? 'Active' : 'Disabled'}</td>
              <td>{i.active && (
                <button onClick={() => disable(i.id)} className="px-3 py-1 bg-red-600 text-white rounded">Disable</button>
              )}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
