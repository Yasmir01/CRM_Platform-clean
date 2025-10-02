import React, { useState } from 'react';

type Props = {
  endpoint: string;
  label: string;
};

export function ExportButton({ endpoint, label }: Props) {
  const [format, setFormat] = useState<'csv' | 'pdf'>('csv');

  async function handleExport() {
    const res = await fetch(`${endpoint}?format=${format}`, { credentials: 'include' });
    if (!res.ok) {
      alert('Export failed');
      return;
    }
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = label.replace(/\s+/g, '_').toLowerCase() + '.' + format;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  return (
    <div className="export-button-group">
      <select value={format} onChange={(e) => setFormat(e.target.value as 'csv' | 'pdf')}>
        <option value="csv">CSV</option>
        <option value="pdf">PDF</option>
      </select>
      <button onClick={handleExport}>{label}</button>
    </div>
  );
}
