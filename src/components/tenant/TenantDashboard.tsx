import React, { useEffect, useState } from 'react';

export default function TenantDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async function () {
      try {
        const res = await fetch('/api/tenant/dashboard');
        const json = await res.json();
        setData(json);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <p className="p-6">Loading your dashboard...</p>;
  if (!data?.lease) return <p className="p-6">No active lease found.</p>;

  const lease = data.lease;
  const payments = data.payments || [];

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold mb-4">Welcome, {data.tenant?.name}</h1>

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-2">Rent Overview</h2>
        <p>
          <strong>Property:</strong> {lease.property?.title || lease.property?.address}
        </p>
        <p>
          <strong>Rent Amount:</strong> ${lease.rentAmount?.toFixed?.(2) ?? (lease.rentAmount || 0).toFixed(2)}
        </p>
        <p>
          <strong>Next Due Date:</strong> {lease.dueDate ? new Date(lease.dueDate).toLocaleDateString() : 'N/A'}
        </p>
      </div>

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Recent Payments</h2>
        {payments.length === 0 ? (
          <p>No payments found.</p>
        ) : (
          <table className="w-full border">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-3 py-2 text-left">Date</th>
                <th className="px-3 py-2 text-left">Amount</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2 text-left">Receipt</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p: any) => (
                <tr key={p.id} className="border-t">
                  <td className="px-3 py-2">{new Date(p.createdAt).toLocaleDateString()}</td>
                  <td className="px-3 py-2">${(p.amount || 0).toFixed(2)}</td>
                  <td className="px-3 py-2">{p.status}</td>
                  <td className="px-3 py-2">
                    {p.status === 'PAID' || p.status === 'success' || p.status === 'succeeded' ? (
                      <a href={`/api/payments/${p.id}/receipt`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                        Download
                      </a>
                    ) : (
                      '-'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Reminders &amp; Notices</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>Rent reminders are automatically sent 7 days before, on due date, and 3 days overdue.</li>
          <li>Payment receipts are available for download after successful payments.</li>
        </ul>
      </div>
    </div>
  );
}
