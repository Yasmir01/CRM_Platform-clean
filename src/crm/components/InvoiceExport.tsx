import * as React from 'react';

export default function InvoiceExportControls() {
  const [format, setFormat] = React.useState<'csv' | 'pdf'>('csv');
  const [status, setStatus] = React.useState('');
  const [vendorId, setVendorId] = React.useState('');
  const [propertyId, setPropertyId] = React.useState('');
  const [dateFrom, setDateFrom] = React.useState('');
  const [dateTo, setDateTo] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [vendors, setVendors] = React.useState<any[]>([]);
  const [properties, setProperties] = React.useState<any[]>([]);

  React.useEffect(() => {
    const load = async () => {
      try {
        const v = await fetch('/api/admin/filters/vendors', { credentials: 'include' }).then((r) => r.ok ? r.json() : []);
        const p = await fetch('/api/admin/filters/properties', { credentials: 'include' }).then((r) => r.ok ? r.json() : []);
        setVendors(Array.isArray(v) ? v : []);
        setProperties(Array.isArray(p) ? p : []);
      } catch {
        setVendors([]);
        setProperties([]);
      }
    };
    load();
  }, []);

  const exportInvoices = async () => {
    setBusy(true);
    try {
      const res = await fetch('/api/admin/invoices/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          format,
          filters: {
            status: status || undefined,
            vendorId: vendorId || undefined,
            propertyId: propertyId || undefined,
            dateFrom: dateFrom || undefined,
            dateTo: dateTo || undefined,
          },
        }),
      });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoices.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="p-4 border rounded shadow bg-white space-y-4">
      <h2 className="text-lg font-bold">Export Invoices</h2>

      <div>
        <label className="block font-medium">Format</label>
        <select value={format} onChange={(e) => setFormat(e.target.value as 'csv' | 'pdf')} className="border p-2 rounded w-full">
          <option value="csv">CSV</option>
          <option value="pdf">PDF</option>
        </select>
      </div>

      <div>
        <label className="block font-medium">Status</label>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="border p-2 rounded w-full">
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div>
        <label className="block font-medium">Vendor</label>
        <select value={vendorId} onChange={(e) => setVendorId(e.target.value)} className="border p-2 rounded w-full">
          <option value="">All Vendors</option>
          {vendors.map((v) => (
            <option key={v.id} value={v.id}>{v.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block font-medium">Property</label>
        <select value={propertyId} onChange={(e) => setPropertyId(e.target.value)} className="border p-2 rounded w-full">
          <option value="">All Properties</option>
          {properties.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block font-medium">Date Range</label>
        <div className="flex space-x-2">
          <select
            onChange={(e) => {
              const val = e.target.value;
              const now = new Date();
              const todayStr = new Date().toISOString().split('T')[0];
              let from = '';
              let to = todayStr;
              if (val === 'this_month') {
                from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
              } else if (val === 'last_month') {
                const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                const end = new Date(now.getFullYear(), now.getMonth(), 0);
                from = start.toISOString().split('T')[0];
                to = end.toISOString().split('T')[0];
              } else if (val === 'last_90') {
                const d = new Date();
                d.setDate(d.getDate() - 90);
                from = d.toISOString().split('T')[0];
              } else if (val === 'ytd') {
                from = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
              }
              setDateFrom(from);
              setDateTo(to);
            }}
            className="border p-2 rounded w-full"
          >
            <option value="">Custom</option>
            <option value="this_month">This Month</option>
            <option value="last_month">Last Month</option>
            <option value="last_90">Last 90 Days</option>
            <option value="ytd">Year to Date</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="border p-2 rounded w-full" />
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="border p-2 rounded w-full" />
        </div>
      </div>

      <button onClick={exportInvoices} disabled={busy} className="w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
        {busy ? 'Exporting…' : 'Export'}
      </button>
    </div>
  );
}
