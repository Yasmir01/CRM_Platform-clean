import React, { useEffect, useState } from 'react';

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  company?: { id: string; name: string } | null;
}

interface Company {
  id: string;
  name: string;
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', companyId: '' });

  async function fetchData() {
    setLoading(true);
    try {
      const [contactsRes, companiesRes] = await Promise.all([fetch('/api/contacts'), fetch('/api/companies')]);
      const contactsData = await contactsRes.json();
      const companiesData = await companiesRes.json();
      setContacts(contactsData || []);
      setCompanies(companiesData || []);
    } catch (e) {
      setContacts([]);
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  }

  async function createContact(e: React.FormEvent) {
    e.preventDefault();
    try {
      await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setForm({ firstName: '', lastName: '', email: '', phone: '', companyId: '' });
      fetchData();
    } catch (err) {
      console.error('Create contact error', err);
    }
  }

  async function deleteContact(id: string) {
    try {
      const confirmed = window.confirm('Delete this contact? This action cannot be undone.');
      if (!confirmed) return;
      await fetch('/api/contacts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      fetchData();
    } catch (err) {
      console.error('Delete contact error', err);
    }
  }

  // inline edit state
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editForm, setEditForm] = React.useState({ firstName: '', lastName: '', email: '', phone: '', companyId: '' });

  function startEdit(c: Contact) {
    setEditingId(c.id);
    setEditForm({ firstName: c.firstName, lastName: c.lastName, email: c.email, phone: c.phone || '', companyId: c.company?.id || '' });
  }

  async function saveEdit(id: string) {
    try {
      await fetch('/api/contacts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...editForm }),
      });
      setEditingId(null);
      fetchData();
    } catch (err) {
      console.error('Update contact error', err);
    }
  }

  function cancelEdit() {
    setEditingId(null);
  }

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Contacts</h1>

      <form onSubmit={createContact} className="grid grid-cols-2 gap-2 mb-6">
        <input
          type="text"
          placeholder="First name"
          value={form.firstName}
          onChange={(e) => setForm({ ...form, firstName: e.target.value })}
          className="border p-2 rounded"
          required
        />
        <input
          type="text"
          placeholder="Last name"
          value={form.lastName}
          onChange={(e) => setForm({ ...form, lastName: e.target.value })}
          className="border p-2 rounded"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="border p-2 rounded"
          required
        />
        <input
          type="text"
          placeholder="Phone"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="border p-2 rounded"
        />
        <select
          value={form.companyId}
          onChange={(e) => setForm({ ...form, companyId: e.target.value })}
          className="border p-2 rounded col-span-2"
        >
          <option value="">No Company</option>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded col-span-2">
          Add Contact
        </button>
      </form>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="min-w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Phone</th>
              <th className="p-2 border">Company</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((c) => (
              <tr key={c.id}>
                <td className="p-2 border">{c.firstName} {c.lastName}</td>
                <td className="p-2 border">{c.email}</td>
                <td className="p-2 border">{c.phone}</td>
                <td className="p-2 border">{c.company?.name || '-'}</td>
                <td className="p-2 border">
                  <button
                    onClick={() => deleteContact(c.id)}
                    className="px-2 py-1 bg-red-500 text-white rounded"
                  >
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
