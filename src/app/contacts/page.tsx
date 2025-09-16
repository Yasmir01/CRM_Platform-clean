"use client";

"use client";

import React, { useEffect, useState } from "react";

interface Contact {
  id: string;
  firstName?: string;
  lastName?: string;
  first?: string; // legacy support
  name?: string;
  email?: string | null;
  phone?: string | null;
  company?: { id?: string; name?: string } | null;
  notes?: string | null;
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Form
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "" });
  const [editingId, setEditingId] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const LIMIT = 10;

  const fetchContacts = async (pageToFetch = page) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/contacts?page=${pageToFetch}&limit=${LIMIT}`);
      if (!res.ok) throw new Error('Failed fetching contacts');
      const data = await res.json();
      const list = (data.contacts || []).map((item: any) => ({
        id: item.id,
        firstName: item.firstName || item.first || undefined,
        lastName: item.lastName || undefined,
        name: item.name || `${item.firstName || item.first || ""} ${item.lastName || ""}`.trim(),
        email: item.email || null,
        phone: item.phone || null,
        company: item.company || null,
        notes: item.notes || null,
      }));
      setContacts(list);
      setTotalPages(data.totalPages || 1);
      setPage(data.page || 1);
    } catch (e) {
      console.error('fetchContacts error', e);
      setContacts([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchContacts(page); }, [page]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingId ? "PUT" : "POST";
    const body = editingId ? { id: editingId, ...form } : form;

    const res = await fetch("/api/contacts", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      console.error("Failed to save contact", await res.text());
      return;
    }

    await fetchContacts(1); // refresh first page after create/update

    setForm({ firstName: "", lastName: "", email: "", phone: "" });
    setEditingId(null);
  };

  const handleEdit = (c: Contact) => {
    setEditingId(c.id);
    setForm({ firstName: c.firstName || "", lastName: c.lastName || "", email: c.email || "", phone: c.phone || "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this contact?")) return;
    const res = await fetch("/api/contacts", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    if (!res.ok) {
      console.error("Failed to delete", await res.text());
      return;
    }
    // if last item on page removed, go to previous page when appropriate
    if (contacts.length === 1 && page > 1) {
      setPage(page - 1);
    } else {
      await fetchContacts(page);
    }
  };

  const filtered = contacts.filter((c) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return `${c.name || ""} ${c.email || ""}`.toLowerCase().includes(q);
  });

  if (loading) return <p className="p-4">Loading...</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Contacts</h1>

      <div className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Search contacts..."
          className="border rounded px-3 py-2 flex-1"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="border p-2">Name</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Phone</th>
            <th className="border p-2">Company</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((c) => (
            <tr key={c.id}>
              <td className="border p-2">{c.name}</td>
              <td className="border p-2">{c.email}</td>
              <td className="border p-2">{c.phone || "-"}</td>
              <td className="border p-2">{c.company?.name || "-"}</td>
              <td className="border p-2 space-x-2">
                <button onClick={() => handleEdit(c)} className="bg-blue-500 text-white px-3 py-1 rounded">Edit</button>
                <button onClick={() => handleDelete(c.id)} className="bg-red-500 text-white px-3 py-1 rounded">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
        <button
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          disabled={page === 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          Previous
        </button>

        <span>Page {page} of {totalPages}</span>

        <button
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          disabled={page === totalPages}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
        >
          Next
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-3">
        <h2 className="text-xl font-semibold">{editingId ? "Edit Contact" : "Add Contact"}</h2>
        <div className="grid grid-cols-2 gap-3">
          <input type="text" placeholder="First Name" className="border rounded px-3 py-2 w-full" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
          <input type="text" placeholder="Last Name" className="border rounded px-3 py-2 w-full" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
        </div>
        <input type="email" placeholder="Email" className="border rounded px-3 py-2 w-full" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <input type="text" placeholder="Phone" className="border rounded px-3 py-2 w-full" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <div className="flex gap-2">
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">{editingId ? "Update Contact" : "Add Contact"}</button>
          {editingId && <button type="button" onClick={() => { setEditingId(null); setForm({ firstName: "", lastName: "", email: "", phone: "" }); }} className="bg-gray-200 px-4 py-2 rounded">Cancel</button>}
        </div>
      </form>
    </div>
  );
}
