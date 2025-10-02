import { useQuery } from '@tanstack/react-query';

async function approve(invoiceId: string, approveFlag: boolean) {
  const r = await fetch('/api/admin/invoices/approve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ invoiceId, approve: approveFlag }),
  });
  if (!r.ok) throw new Error('Failed to update invoice');
}

export default function VendorInvoiceApprovals() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['vendor_invoices'],
    queryFn: async () => {
      const r = await fetch('/api/admin/invoices/list', {
        credentials: 'include',
        cache: 'no-store',
      });
      if (!r.ok) throw new Error('Failed to load invoices');
      return r.json();
    },
  });

  if (isLoading) return <div>Loading…</div>;
  if (error) return <div className="text-red-600">Failed to load invoices</div>;

  const invoices = Array.isArray((data as any)?.invoices) ? (data as any).invoices : [];

  return (
    <div className="space-y-3">
      {invoices.map((inv: any) => (
        <div key={inv.id} className="border rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="font-medium">
              ${Number(inv.amount ?? inv.amountUsd ?? 0).toFixed(2)} — {inv.vendor?.name || inv.vendor?.email || 'Vendor'}
            </div>
            <div className="text-xs text-gray-500">
              Job: {inv.requestId || inv.request?.id} • Status: {inv.status || 'pending'}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              className="px-3 py-1 rounded bg-green-600 text-white"
              onClick={async () => {
                await approve(inv.id, true);
                refetch();
              }}
            >
              Approve
            </button>
            <button
              className="px-3 py-1 rounded bg-red-600 text-white"
              onClick={async () => {
                await approve(inv.id, false);
                refetch();
              }}
            >
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
