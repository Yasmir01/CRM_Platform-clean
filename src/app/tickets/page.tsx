"use client";

import { useState, useEffect } from "react";

type Ticket = {
  id: string;
  title: string;
  description?: string;
  priority?: string;
  status?: string;
  createdAt: string;
};

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: "", description: "", priority: "Low" });
  const [editingId, setEditingId] = useState<string | null>(null);

  // Fetch tickets
  useEffect(() => {
    let mounted = true;
    fetch("/api/tickets")
      .then((res) => res.json())
      .then((data) => {
        if (!mounted) return;
        // Support both shapes: array or { tickets: [...] }
        const items = Array.isArray(data) ? data : (data?.tickets ?? data);
        setTickets(items || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  // Handle input
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  // Save new or update ticket
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingId ? "PUT" : "POST";
    const body = editingId ? { ...form, id: editingId } : form;

    try {
      const res = await fetch("/api/tickets", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) return;
      const updated = await res.json();
      if (editingId) {
        setTickets((tks) => tks.map((t) => (t.id === editingId ? updated : t)));
      } else {
        setTickets((tks) => [updated, ...tks]);
      }
      setForm({ title: "", description: "", priority: "Low" });
      setEditingId(null);
    } catch (err) {
      console.error(err);
    }
  };

  // Delete ticket
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this ticket?")) return;
    try {
      const res = await fetch("/api/tickets", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setTickets((tks) => tks.filter((t) => t.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Start editing
  const handleEdit = (ticket: Ticket) => {
    setEditingId(ticket.id);
    setForm({
      title: ticket.title,
      description: ticket.description || "",
      priority: ticket.priority || "Low",
    });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Tickets</h1>

      {/* Ticket Form */}
      <form onSubmit={handleSubmit} className="mb-6 space-y-4">
        <input
          type="text"
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
        <select
          name="priority"
          value={form.priority}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        >
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>
        <div>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
            {editingId ? "Update Ticket" : "Add Ticket"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm({ title: "", description: "", priority: "Low" });
              }}
              className="ml-2 bg-gray-400 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Tickets Table */}
      {loading ? (
        <p>Loading...</p>
      ) : tickets.length === 0 ? (
        <p>No tickets found.</p>
      ) : (
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Title</th>
              <th className="p-2 border">Priority</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Created</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((t) => (
              <tr key={t.id}>
                <td className="p-2 border">{t.title}</td>
                <td className="p-2 border">{t.priority}</td>
                <td className="p-2 border">{t.status || "Open"}</td>
                <td className="p-2 border">{new Date(t.createdAt).toLocaleDateString()}</td>
                <td className="p-2 border space-x-2">
                  <button onClick={() => handleEdit(t)} className="text-blue-600">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(t.id)} className="text-red-600">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
