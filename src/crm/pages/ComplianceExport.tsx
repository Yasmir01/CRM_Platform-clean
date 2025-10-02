import React from 'react';

export default function ComplianceExportPage() {
  return (
    <div className="p-4 bg-white shadow rounded">
      <h1 className="text-2xl font-bold mb-4">Compliance Export</h1>
      <p className="mb-6 text-gray-600">Download full escalation logs + SLA policies for audits and reporting.</p>
      <div className="flex gap-3">
        <button
          className="border rounded px-3 py-2"
          onClick={() => window.open('/api/escalations/export?format=csv', '_blank')}
        >
          Export CSV
        </button>
        <button
          className="border rounded px-3 py-2"
          onClick={() => window.open('/api/escalations/export?format=json', '_blank')}
        >
          Export JSON
        </button>
      </div>
    </div>
  );
}
