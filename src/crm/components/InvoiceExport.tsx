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

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block font-medium">From</label>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="border p-2 rounded w-full" />
        </div>
        <div>
          <label className="block font-medium">To</label>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="border p-2 rounded w-full" />
        </div>
      </div>

      <button onClick={exportInvoices} disabled={busy} className="w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
        {busy ? 'Exporting…' : 'Export'}
      </button>
    </div>
  );
}
