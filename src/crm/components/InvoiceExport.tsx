import * as React from 'react';

export default function InvoiceExportControls() {
  const [format, setFormat] = React.useState<'csv' | 'pdf'>('csv');
  const [status, setStatus] = React.useState('');
  const [vendorId, setVendorId] = React.useState('');
  const [propertyId, setPropertyId] = React.useState('');
  const [dateFrom, setDateFrom] = React.useState('');
  const [dateTo, setDateTo] = React.useState('');
  const [busy, setBusy] = React.useState(false);

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
    <div className="mt-2 flex flex-wrap items-center gap-2">
      <select value={format} onChange={(e) => setFormat(e.target.value as 'csv' | 'pdf')} className="border p-2 rounded">
        <option value="csv">CSV</option>
        <option value="pdf">PDF</option>
      </select>
      <select value={status} onChange={(e) => setStatus(e.target.value)} className="border p-2 rounded">
        <option value="">All Status</option>
        <option value="pending">Pending</option>
        <option value="approved">Approved</option>
        <option value="rejected">Rejected</option>
      </select>
      <input placeholder="Vendor ID" value={vendorId} onChange={(e) => setVendorId(e.target.value)} className="border p-2 rounded" />
      <input placeholder="Property ID" value={propertyId} onChange={(e) => setPropertyId(e.target.value)} className="border p-2 rounded" />
      <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="border p-2 rounded" />
      <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="border p-2 rounded" />
      <button onClick={exportInvoices} disabled={busy} className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
        {busy ? 'Exporting…' : 'Export Invoices'}
      </button>
    </div>
  );
}
