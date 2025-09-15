import { useEffect, useState } from 'react';

type Lead = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  message?: string | null;
  status: string;
  createdAt: string;
  subscriber: { id: string; name: string };
};

export default function AdminLeadManagementPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [subscriberFilter, setSubscriberFilter] = useState('ALL');
  const [subscribers, setSubscribers] = useState<{ id: string; name: string; primaryUserId?: string | null }[]>([]);
  const [impersonation, setImpersonation] = useState<{ impersonating?: string | null; originalUserId?: string | null } | null>(null);

  useEffect(() => {
    let mounted = true;
    async function fetchSubscribers() {
      try {
        const res = await fetch('/api/admin/subscribers');
        const data = await res.json();
        if (!mounted) return;
        if (!data.error) setSubscribers(data.subscribers || []);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('fetch subscribers error', e);
      }
    }
    fetchSubscribers();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    async function fetchLeads() {
      try {
        setLoading(true);
        setError('');
        const res = await fetch(`/api/admin/leads?status=${encodeURIComponent(statusFilter)}&subscriberId=${encodeURIComponent(subscriberFilter)}`);
        const data = await res.json();
        if (!mounted) return;
        if (data.error) setError(data.error);
        else setLeads(data.leads || []);
      } catch (err) {
        if (!mounted) return;
        setError('Failed to load leads.');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchLeads();
    return () => {
      mounted = false;
    };
  }, [statusFilter, subscriberFilter]);

  useEffect(() => {
    // fetch current session to detect impersonation
    let mounted = true;
    async function fetchMe() {
      try {
        const res = await fetch('/api/me');
        if (!mounted) return;
        const data = await res.json();
        if (!data || data.error) return;
        const { impersonating, originalUserId } = data;
        setImpersonation({ impersonating: impersonating || null, originalUserId: originalUserId || null });
      } catch (e) {
        // ignore
      }
    }
    fetchMe();
    return () => { mounted = false };
  }, []);

  async function updateStatus(id: string, status: string) {
    try {
      const res = await fetch(`/api/admin/leads/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!data.error && data.lead) {
        setLeads((prev) => prev.map((lead) => (lead.id === id ? { ...lead, status } : lead)));
      } else {
        alert(data.error || 'Failed to update');
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('updateStatus error', e);
      alert('Failed to update status');
    }
  }

  async function impersonate(subscriberPrimaryUserId?: string | null) {
    if (!subscriberPrimaryUserId) return alert('No user available to impersonate for this subscriber');
    try {
      const res = await fetch('/api/superadmin/impersonate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: subscriberPrimaryUserId }),
      });
      const data = await res.json();
      if (!res.ok) return alert(data?.error || 'Failed to impersonate');
      // redirect to subscriber dashboard
      window.location.href = '/dashboard';
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('impersonate error', e);
      alert('Failed to impersonate');
    }
  }

  async function stopImpersonation() {
    try {
      const res = await fetch('/api/superadmin/stop-impersonation', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) return alert(data?.error || 'Failed to stop impersonation');
      window.location.href = '/admin/leads';
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('stop impersonation error', e);
      alert('Failed to stop impersonation');
    }
  }

  if (loading) return <p className="p-6">Loading leads...</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin: Lead Management</h1>

      {impersonation?.originalUserId && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <div className="flex items-center justify-between">
            <div>
              <strong className="mr-2">You are impersonating a subscriber</strong>
              <span className="text-sm text-gray-700">(Exit to return to your admin session)</span>
            </div>
            <div>
              <button onClick={stopImpersonation} className="px-3 py-1 bg-red-600 text-white rounded">Exit Impersonation</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex space-x-4 mb-4">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border p-2 rounded">
          <option value="ALL">All Statuses</option>
          <option value="NEW">New</option>
          <option value="CONTACTED">Contacted</option>
          <option value="QUALIFIED">Qualified</option>
          <option value="CONVERTED">Converted</option>
          <option value="LOST">Lost</option>
        </select>

        <select value={subscriberFilter} onChange={(e) => setSubscriberFilter(e.target.value)} className="border p-2 rounded">
          <option value="ALL">All Subscribers</option>
          {subscribers.map((sub) => (
            <option key={sub.id} value={sub.id}>{sub.name}</option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 shadow">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Subscriber</th>
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Phone</th>
              <th className="p-2 border">Message</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Created</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id} className="border-b">
                <td className="p-2 font-medium">{lead.subscriber?.name || '-'}</td>
                <td className="p-2">{lead.name}</td>
                <td className="p-2">{lead.email}</td>
                <td className="p-2">{lead.phone || '-'}</td>
                <td className="p-2">{lead.message || '-'}</td>
                <td className="p-2 font-semibold">{lead.status}</td>
                <td className="p-2">{new Date(lead.createdAt).toLocaleDateString()}</td>
                <td className="p-2 space-x-2">
                  <select value={lead.status} onChange={(e) => updateStatus(lead.id, e.target.value)} className="border p-1 rounded mr-2">
                    <option value="NEW">New</option>
                    <option value="CONTACTED">Contacted</option>
                    <option value="QUALIFIED">Qualified</option>
                    <option value="CONVERTED">Converted</option>
                    <option value="LOST">Lost</option>
                  </select>

                  {/* Impersonate button: find subscriber's primaryUserId from subscribers list */}
                  {(() => {
                    const sub = subscribers.find((s) => s.name === lead.subscriber?.name || s.id === lead.subscriber?.id);
                    const primaryUserId = sub ? sub.primaryUserId : null;
                    return (
                      <button onClick={() => impersonate(primaryUserId)} className="px-3 py-1 bg-blue-600 text-white rounded">
                        Impersonate
                      </button>
                    );
                  })()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
