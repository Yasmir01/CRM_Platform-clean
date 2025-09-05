import RoleLayout from '../components/layout/RoleLayout';
import { PaymentsPage } from '../components/PaymentsPage';
import { MaintenanceRequestForm } from '../components/MaintenanceRequestForm';

export function TenantDashboard() {
  return (
    <RoleLayout>
      <h1>Tenant Dashboard</h1>
      <p>Welcome to your tenant portal.</p>
    </RoleLayout>
  );
}

export function TenantPayments() {
  return (
    <RoleLayout>
      <h1>Payments</h1>
      <PaymentsPage />
    </RoleLayout>
  );
}

export function TenantMaintenance() {
  return (
    <RoleLayout>
      <h1>Maintenance</h1>
      <MaintenanceRequestForm />
    </RoleLayout>
  );
}

export function TenantLease() {
  return (
    <RoleLayout>
      <h1>Lease</h1>
      <p>View and sign your lease.</p>
    </RoleLayout>
  );
}

export function OwnerDashboard() {
  return (
    <RoleLayout>
      <h1>Owner Dashboard</h1>
      <p>View your properties and monthly statements here.</p>
    </RoleLayout>
  );
}

export function OwnerStatements() {
  return (
    <RoleLayout>
      <h1>Statements</h1>
      <p>Monthly statements TBD.</p>
    </RoleLayout>
  );
}

export function OwnerProperties() {
  return (
    <RoleLayout>
      <h1>Properties</h1>
      <p>Manage owner properties.</p>
    </RoleLayout>
  );
}

export function VendorDashboard() {
  const [requests, setRequests] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [uploadingId, setUploadingId] = React.useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/vendor/requests', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      setRequests(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => { load(); }, []);

  const markComplete = async (id: string) => {
    await fetch(`/api/vendor/requests/${id}/complete`, { method: 'POST', credentials: 'include' });
    await load();
  };

  const handleFile = async (id: string, file: File) => {
    try {
      setUploadingId(id);
      const presignRes = await fetch('/api/storage/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ fileName: file.name, contentType: file.type })
      });
      if (!presignRes.ok) throw new Error('Failed to get upload URL');
      const { uploadUrl, key } = await presignRes.json();
      const up = await fetch(uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
      if (!up.ok) throw new Error('Upload failed');
      const attachRes = await fetch(`/api/maintenance/${id}/attachments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ key, fileType: file.type, fileName: file.name })
      });
      if (!attachRes.ok) throw new Error('Failed to save attachment');
      await load();
    } finally {
      setUploadingId(null);
    }
  };

  return (
    <RoleLayout>
      <h1>Vendor Portal</h1>
      {error && <p className="text-red-600">{error}</p>}
      {loading ? (
        <p>Loading...</p>
      ) : requests.length === 0 ? (
        <p>No assigned requests.</p>
      ) : (
        <div className="space-y-4">
          {requests.map((r) => (
            <div key={r.id} className="border p-4 rounded">
              <h2 className="font-semibold">{r.property?.address || 'Property'}</h2>
              <p className="text-sm text-gray-600">{r.category || 'General'} • {r.priority || 'normal'}</p>
              <p className="text-xs text-gray-500">Request ID: {r.id}</p>
              {r.description && <p className="mt-2">{r.description}</p>}

              {Array.isArray(r.attachments) && r.attachments.length > 0 && (
                <div className="mt-2">
                  <h3 className="text-sm font-semibold">Attachments</h3>
                  <div className="flex flex-col gap-1">
                    {r.attachments.map((a: any) => (
                      <a key={a.id} href={`/api/storage/download?key=${encodeURIComponent(a.fileUrl)}`} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                        {a.fileName || a.fileUrl}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-3 flex items-center gap-2">
                <label className="cursor-pointer bg-blue-600 text-white px-3 py-1 rounded">
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*,application/pdf"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleFile(r.id, f);
                      e.currentTarget.value = '';
                    }}
                  />
                  {uploadingId === r.id ? 'Uploading...' : 'Upload File'}
                </label>
                <button onClick={() => markComplete(r.id)} className="px-3 py-1 bg-green-600 text-white rounded">
                  Mark as Completed
                </button>
              </div>

              <VendorInvoiceUploader requestId={r.id} onUploaded={load} />
            </div>
          ))}
        </div>
      )}
    </RoleLayout>
  );
}

function VendorInvoiceUploader({ requestId, onUploaded }: { requestId: string; onUploaded?: () => void }) {
  const [files, setFiles] = React.useState<FileList | null>(null);
  const [amount, setAmount] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const submit = async () => {
    if (!files || !amount) return;
    try {
      setSubmitting(true);
      setError(null);
      const metas: Array<{ key: string; fileType: string; fileName: string }> = [];
      for (const file of Array.from(files)) {
        const presignRes = await fetch('/api/storage/presign', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ fileName: file.name, contentType: file.type })
        });
        if (!presignRes.ok) throw new Error('Failed to get upload URL');
        const { uploadUrl, key } = await presignRes.json();
        const up = await fetch(uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
        if (!up.ok) throw new Error('Upload failed');
        metas.push({ key, fileType: file.type, fileName: file.name });
      }

      const res = await fetch(`/api/vendor/requests/${requestId}/invoice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ amount: parseFloat(amount), files: metas })
      });
      if (!res.ok) throw new Error('Failed to save invoice');
      setFiles(null);
      setAmount('');
      if (onUploaded) onUploaded();
    } catch (e: any) {
      setError(e?.message || 'Upload failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-3 border-t pt-3">
      <h3 className="font-semibold text-sm mb-2">Upload Invoice</h3>
      {error && <p className="text-red-600 text-sm mb-1">{error}</p>}
      <div className="flex items-center gap-2">
        <input type="file" accept="application/pdf,image/*" multiple onChange={(e) => setFiles(e.target.files)} />
        <input type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} className="border p-2 rounded" />
        <button onClick={submit} disabled={submitting} className="px-3 py-1 bg-blue-600 text-white rounded">
          {submitting ? 'Uploading…' : 'Upload Invoice'}
        </button>
      </div>
    </div>
  );
}

export function VendorWorkOrders() {
  return <VendorDashboard />;
}

export function VendorProfile() {
  return (
    <RoleLayout>
      <h1>Profile</h1>
      <p>Update profile.</p>
    </RoleLayout>
  );
}

export function ManagerDashboard() {
  return (
    <RoleLayout>
      <h1>Manager Dashboard</h1>
      <p>Manage tenants, owners, and maintenance.</p>
    </RoleLayout>
  );
}

export function ManagerTenants() {
  return (
    <RoleLayout>
      <h1>Tenants</h1>
      <p>Manage tenants.</p>
    </RoleLayout>
  );
}

export function ManagerOwners() {
  return (
    <RoleLayout>
      <h1>Owners</h1>
      <p>Manage owners.</p>
    </RoleLayout>
  );
}

export function ManagerMaintenance() {
  return (
    <RoleLayout>
      <h1>Maintenance</h1>
      <p>Oversee maintenance.</p>
    </RoleLayout>
  );
}

export function AdminDashboard() {
  return (
    <RoleLayout>
      <h1>Admin Dashboard</h1>
      <p>System administration.</p>
    </RoleLayout>
  );
}

import PermissionEditor from '../components/admin/PermissionEditor';
import UserPermissionsGrid from '../components/admin/UserPermissionsGrid';
import ExportSchedule from '../components/admin/ExportSchedule';
import ImpersonationToggle from '../components/admin/ImpersonationToggle';

export function AdminUsers() {
  const params = new URLSearchParams(window.location.search);
  const userId = params.get('id') || '';
  return (
    <RoleLayout>
      <h1>Users</h1>
      {userId ? (
        <PermissionEditor userId={userId} />
      ) : (
        <>
          <UserPermissionsGrid />
          <ExportSchedule />
          <ImpersonationToggle />
        </>
      )}
    </RoleLayout>
  );
}

export function AdminLogs() {
  return (
    <RoleLayout>
      <h1>System Logs</h1>
      <p>View logs.</p>
    </RoleLayout>
  );
}

// --- Tenant AutoPay Settings ---
import * as React from 'react';
export function TenantAutopay() {
  const [autopay, setAutopay] = React.useState<any>(null);
  const [amount, setAmount] = React.useState('');
  const [day, setDay] = React.useState(1);

  React.useEffect(() => {
    fetch('/api/payments/autopay', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setAutopay(d))
      .catch(() => setAutopay(null));
  }, []);

  const save = async () => {
    const res = await fetch('/api/payments/autopay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ amount: parseFloat(amount), dayOfMonth: day, frequency: 'monthly' }),
    });
    if (res.ok) setAutopay(await res.json());
  };

  const cancel = async () => {
    await fetch('/api/payments/autopay', { method: 'DELETE', credentials: 'include' });
    setAutopay(null);
  };

  return (
    <RoleLayout>
      <h1>AutoPay Settings</h1>
      {autopay ? (
        <div className="space-y-2">
          <p>
            AutoPay: <strong>${autopay.amount}</strong> on day {autopay.dayOfMonth} each month
          </p>
          <button onClick={cancel} className="w-full bg-red-600 text-white p-2 rounded">
            Cancel AutoPay
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Rent amount"
            className="border p-2 rounded w-full"
          />
          <input
            type="number"
            value={day}
            onChange={(e) => setDay(parseInt(e.target.value))}
            min={1}
            max={28}
            className="border p-2 rounded w-full"
          />
          <button onClick={save} className="w-full bg-blue-600 text-white p-2 rounded">
            Enable AutoPay
          </button>
        </div>
      )}
    </RoleLayout>
  );
}
