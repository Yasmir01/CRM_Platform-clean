import React, { useEffect, useState } from 'react';

interface Ticket {
  id: string;
  title: string;
  description?: string | null;
  priority?: string | null;
  status?: string | null;
  company?: { name: string } | null;
  contact?: { name: string } | null;
  createdAt: string;
}

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Low');
  const [status, setStatus] = useState('Open');
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  async function fetchTickets() {
    setLoading(true);
    try {
      const res = await fetch('/api/tickets');
      const data = await res.json();
      const items = Array.isArray(data) ? data : (data?.tickets ?? data);
      setTickets(items || []);
    } catch (e) {
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }

  async function createTicket(e?: React.FormEvent) {
    if (e) e.preventDefault();
    try {
      await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, priority, status }),
      });
      resetForm();
      fetchTickets();
    } catch (err) {
      console.error('Create ticket error', err);
    }
  }

  async function updateTicket(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!editId) return;
    try {
      await fetch('/api/tickets', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editId, title, description, priority, status }),
      });
      resetForm();
      fetchTickets();
    } catch (err) {
      console.error('Update ticket error', err);
    }
  }

  async function deleteTicket(id: string) {
    try {
      const confirmed = window.confirm('Delete this ticket? This action cannot be undone.');
      if (!confirmed) return;
      await fetch('/api/tickets', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (editId === id) resetForm();
      fetchTickets();
    } catch (err) {
      console.error('Delete ticket error', err);
    }
  }

  function startEdit(ticket: Ticket) {
    setEditId(ticket.id);
    setTitle(ticket.title);
    setDescription(ticket.description || '');
    setPriority(ticket.priority || 'Low');
    setStatus(ticket.status || 'Open');
  }

  function resetForm() {
    setEditId(null);
    setTitle('');
    setDescription('');
    setPriority('Low');
    setStatus('Open');
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Tickets</h1>

      <form onSubmit={editId ? updateTicket : createTicket} className="grid grid-cols-1 gap-2 mb-6 max-w-2xl">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border p-2 rounded"
          required
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border p-2 rounded h-24"
        />

        <div className="flex gap-2">
          <select value={priority} onChange={(e) => setPriority(e.target.value)} className="border p-2 rounded">
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>

          <select value={status} onChange={(e) => setStatus(e.target.value)} className="border p-2 rounded">
            <option>Open</option>
            <option>In Progress</option>
            <option>Closed</option>
          </select>

          <div>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
              {editId ? 'Update Ticket' : 'Add Ticket'}
            </button>
            {editId && (
              <button type="button" onClick={resetForm} className="ml-2 px-4 py-2 bg-gray-300 rounded">
                Cancel
              </button>
            )}
          </div>
        </div>
      </form>

      {loading ? (
        <p>Loading...</p>
      ) : tickets.length === 0 ? (
        <p>No tickets found.</p>
      ) : (
        <table className="min-w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Title</th>
              <th className="p-2 border">Priority</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Company</th>
              <th className="p-2 border">Contact</th>
              <th className="p-2 border">Created</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((t) => (
              <tr key={t.id}>
                <td className="p-2 border">{t.title}</td>
                <td className="p-2 border">{t.priority}</td>
                <td className="p-2 border">{t.status}</td>
                <td className="p-2 border">{t.company?.name || '-'}</td>
                <td className="p-2 border">{t.contact?.name || '-'}</td>
                <td className="p-2 border">{new Date(t.createdAt).toLocaleDateString()}</td>
                <td className="p-2 border">
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(t)} className="px-2 py-1 bg-yellow-500 text-white rounded">
                      Edit
                    </button>
                    <button onClick={() => deleteTicket(t.id)} className="px-2 py-1 bg-red-600 text-white rounded">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
