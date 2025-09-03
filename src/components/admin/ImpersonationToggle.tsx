import { useEffect, useState } from 'react';

export default function ImpersonationToggle() {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/settings/export-schedule', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        setEnabled(Boolean(d.allowImpersonation));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function toggle() {
    const newValue = !enabled;
    setEnabled(newValue);
    await fetch('/api/admin/settings/impersonation', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ allowImpersonation: newValue }),
    });
  }

  if (loading) return null;

  return (
    <div className="p-4 border rounded bg-gray-50 mt-6 flex items-center justify-between">
      <div>
        <h2 className="font-bold">Allow Impersonation</h2>
        <p className="text-sm text-gray-600">
          If enabled, Admins in this org can impersonate Managers, Owners, Vendors, and Tenants for troubleshooting. All impersonation is logged.
        </p>
      </div>
      <button
        onClick={toggle}
        className={`px-4 py-2 rounded text-white ${enabled ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-500 hover:bg-gray-600'}`}
      >
        {enabled ? 'Enabled' : 'Disabled'}
      </button>
    </div>
  );
}
