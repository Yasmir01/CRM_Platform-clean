"use client";

import { useEffect, useState } from "react";
import { useSession } from '@/auth/useSession';

type Ticket = {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  createdAt: string;
  company?: { id: string; name?: string } | null;
  contact?: { id: string; name?: string } | null;
};

export default function TicketsPage() {
  const sess = useSession();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  // Create ticket form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
      if (debouncedSearch) params.set('search', debouncedSearch);

      const res = await fetch(`/api/tickets?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch tickets');
      const json = await res.json();
      setTickets(json.tickets || []);
      setTotal(json.total || 0);
    } catch (err) {
      console.error('Failed to fetch tickets', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, debouncedSearch]);

  const totalPages = Math.max(Math.ceil(total / pageSize), 1);

  const isLoadingSession = (sess as any).loading;

  // Dynamic toasts (optional)
  const toasts = ((): any => {
    try {
      // eslint-disable-next-line global-require
      return require('../../crm/components/GlobalNotificationProvider').useNotifications();
    } catch (e) {
      return null;
    }
  })();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!title || !description) {
      setFormError('Title and description are required');
      return;
    }
    setCreating(true);
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, priority }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error || 'Failed to create ticket');
      }
      // Reset form
      setTitle('');
      setDescription('');
      setPriority('medium');
      // feedback
      if (toasts) toasts.showSuccess('Created', 'Ticket created successfully');
      else { try { window.alert('Ticket created successfully'); } catch (e) {} }
      // refresh list
      setPage(1);
      fetchTickets();
    } catch (err: any) {
      console.error('Create ticket failed', err);
      setFormError(err?.message || 'Failed to create ticket');
      if (toasts) toasts.showError('Create failed', String(err?.message || err));
      else { try { window.alert('Error creating ticket'); } catch (e) {} }
    } finally {
      setCreating(false);
    }
  };

  if (isLoadingSession) return <p>Loading...</p>;

  return (
    <div className="tickets-page p-6">
      <h1 className="tickets-title text-2xl font-bold mb-4">Support Tickets</h1>

      {/* Create form */}
      <div className="create-ticket-wrap mb-6 max-w-3xl w-full">
        <form onSubmit={handleCreate} className="create-ticket-form space-y-4 bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold">Create New Ticket</h2>

          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="create-ticket-title w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="create-ticket-description w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="create-ticket-priority w-full border rounded px-3 py-2"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          {formError && <div className="text-sm text-red-600">{formError}</div>}

          <div>
            <button
              type="submit"
              disabled={creating}
              className="create-ticket-submit bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {creating ? 'Creating...' : 'Create Ticket'}
            </button>
          </div>
        </form>
      </div>

      <div className="tickets-actions flex items-center justify-between mb-4">
        <input
          type="text"
          placeholder="Search tickets..."
          value={search}
          onChange={(e) => { setPage(1); setSearch(e.target.value); }}
          className="tickets-search-input border rounded p-2 w-1/2"
        />

        <div className="tickets-controls flex items-center gap-2">
          <select
            value={pageSize}
            onChange={(e) => { setPage(1); setPageSize(Number(e.target.value)); }}
            className="tickets-page-size-select border rounded p-2"
          >
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
          </select>
        </div>
      </div>

      <div className="tickets-table-wrap overflow-x-auto">
        <table className="tickets-table min-w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 border text-left">Title</th>
              <th className="px-4 py-2 border text-left">Priority</th>
              <th className="px-4 py-2 border text-left">Status</th>
              <th className="px-4 py-2 border text-left">Company</th>
              <th className="px-4 py-2 border text-left">Contact</th>
              <th className="px-4 py-2 border text-left">Created</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-4">Loading...</td>
              </tr>
            ) : tickets.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-4">No tickets found</td>
              </tr>
            ) : (
              tickets.map((t) => (
                <tr key={t.id} className="tickets-row">
                  <td className="px-4 py-2 border">{t.title}</td>
                  <td className="px-4 py-2 border">{t.priority}</td>
                  <td className="px-4 py-2 border">{t.status}</td>
                  <td className="px-4 py-2 border">{t.company?.name ?? '-'}</td>
                  <td className="px-4 py-2 border">{(t.contact as any)?.name ?? '-'}</td>
                  <td className="px-4 py-2 border">{new Date(t.createdAt).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="tickets-pagination flex justify-between items-center mt-4">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page === 1}
          className="tickets-prev-button px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          Prev
        </button>

        <span className="tickets-page-info">Page {page} of {totalPages}</span>

        <button
          onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          disabled={page === totalPages || totalPages === 0}
          className="tickets-next-button px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
