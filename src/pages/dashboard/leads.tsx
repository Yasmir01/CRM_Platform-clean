import { useEffect, useState } from 'react';

type Lead = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  message?: string | null;
  status: string;
  createdAt: string;
};

export default function LeadManagementPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    let mounted = true;
    async function fetchLeads() {
      try {
        setLoading(true);
        setError('');
        const res = await fetch(`/api/subscriber/leads?status=${encodeURIComponent(filter)}`);
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
  }, [filter]);

  async function updateStatus(id: string, status: string) {
    try {
      const res = await fetch(`/api/subscriber/leads/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!data.error) {
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

  if (loading) return <p className="p-6">Loading leads...</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Lead Management</h1>

      <div className="mb-4">
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="border p-2 rounded">
          <option value="ALL">All Leads</option>
          <option value="NEW">New</option>
          <option value="CONTACTED">Contacted</option>
          <option value="QUALIFIED">Qualified</option>
          <option value="CONVERTED">Converted</option>
          <option value="LOST">Lost</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 shadow">
          <thead className="bg-gray-100">
            <tr>
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
                <td className="p-2">{lead.name}</td>
                <td className="p-2">{lead.email}</td>
                <td className="p-2">{lead.phone || '-'}</td>
                <td className="p-2">{lead.message || '-'}</td>
                <td className="p-2 font-semibold">{lead.status}</td>
                <td className="p-2">{new Date(lead.createdAt).toLocaleDateString()}</td>
                <td className="p-2">
                  <select
                    value={lead.status}
                    onChange={(e) => updateStatus(lead.id, e.target.value)}
                    className="border p-1 rounded"
                  >
                    <option value="NEW">New</option>
                    <option value="CONTACTED">Contacted</option>
                    <option value="QUALIFIED">Qualified</option>
                    <option value="CONVERTED">Converted</option>
                    <option value="LOST">Lost</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
