import React, { useEffect, useState } from 'react';
import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/router';

interface Company {
  id: string;
  name: string;
  domain: string | null;
}

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
}

export default function CompanyDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [company, setCompany] = useState<Company | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchData() {
    if (!id) return;
    setLoading(true);

    try {
      const [companyRes, contactsRes] = await Promise.all([
        fetch(`/api/companies?id=${id}`),
        fetch(`/api/contacts?companyId=${id}`),
      ]);

      if (companyRes.ok) {
        setCompany(await companyRes.json());
      } else {
        setCompany(null);
      }

      if (contactsRes.ok) {
        setContacts(await contactsRes.json());
      } else {
        setContacts([]);
      }
    } catch (e) {
      setCompany(null);
      setContacts([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, [id]);

  // NEW CONTACT FORM STATE & HANDLER
  const [newContact, setNewContact] = useState({ firstName: '', lastName: '', email: '', phone: '' });

  async function handleAddContact(e: React.FormEvent) {
    e.preventDefault();
    if (!id) return;
    try {
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: id, ...newContact }),
      });
      if (res.ok) {
        const created = await res.json();
        setContacts((prev) => [created, ...prev]);
        setNewContact({ firstName: '', lastName: '', email: '', phone: '' });
      } else {
        const err = await res.json().catch(() => ({}));
        console.error('Failed to create contact', err);
      }
    } catch (e) {
      console.error('Add contact error', e);
    }
  }

  // search & pagination state
  const [q, setQ] = React.useState('');
  const [page, setPage] = React.useState(1);
  const pageSize = 10;

  const filtered = React.useMemo(() => {
    const lower = q.trim().toLowerCase();
    if (!lower) return contacts;
    return contacts.filter((c) => (`${c.firstName} ${c.lastName} ${c.email || ''}`).toLowerCase().includes(lower));
  }, [contacts, q]);

  const total = filtered.length;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

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
    } catch (e) {
      console.error('Delete contact error', e);
    }
  }

  // inline edit for contacts on company detail
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editForm, setEditForm] = React.useState({ firstName: '', lastName: '', email: '', phone: '' });

  function startEdit(c: Contact) {
    setEditingId(c.id);
    setEditForm({ firstName: c.firstName, lastName: c.lastName, email: c.email, phone: c.phone || '' });
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
    } catch (e) {
      console.error('Update contact error', e);
    }
  }

  function cancelEdit() {
    setEditingId(null);
  }

  if (loading) return <p className="p-6">Loading...</p>;

  if (!company) return <p className="p-6">Company not found</p>;

  return (
    <div className="p-6">
      <button onClick={() => router.push('/companies')} className="mb-4 px-3 py-1 bg-gray-200 rounded">← Back to Companies</button>

      <h1 className="text-2xl font-bold mb-2">{company.name}</h1>
      {company.domain && <p className="mb-4 text-gray-600">Domain: {company.domain}</p>}

      <h2 className="text-xl font-semibold mt-6 mb-2">Add Contact</h2>
      <form onSubmit={handleAddContact} className="flex gap-2 mb-6">
        <input placeholder="First Name" value={newContact.firstName} onChange={(e) => setNewContact({ ...newContact, firstName: e.target.value })} className="border px-2 py-1 rounded" required />
        <input placeholder="Last Name" value={newContact.lastName} onChange={(e) => setNewContact({ ...newContact, lastName: e.target.value })} className="border px-2 py-1 rounded" />
        <input placeholder="Email" type="email" value={newContact.email} onChange={(e) => setNewContact({ ...newContact, email: e.target.value })} className="border px-2 py-1 rounded" required />
        <input placeholder="Phone" value={newContact.phone} onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })} className="border px-2 py-1 rounded" />
        <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded">Add</button>
      </form>

      <h2 className="text-xl font-semibold mb-2">Contacts</h2>

      <div className="mb-4 flex items-center gap-2">
        <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search contacts..." className="border p-2 rounded flex-1" />
        <div className="text-sm text-gray-600">{total} results</div>
      </div>

      {paged.length === 0 ? (
        <p>No contacts linked to this company.</p>
      ) : (
        <>
          <table className="min-w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">Name</th>
                <th className="p-2 border">Email</th>
                <th className="p-2 border">Phone</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((c) => (
                <tr key={c.id}>
                  <td className="p-2 border">
                    {editingId === c.id ? (
                      <>
                        <input className="border p-1 rounded w-full mb-1" value={editForm.firstName} onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })} />
                        <input className="border p-1 rounded w-full" value={editForm.lastName} onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })} />
                      </>
                    ) : (
                      <>{c.firstName} {c.lastName}</>
                    )}
                  </td>
                  <td className="p-2 border">
                    {editingId === c.id ? (
                      <input className="border p-1 rounded w-full" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
                    ) : (
                      c.email
                    )}
                  </td>
                  <td className="p-2 border">
                    {editingId === c.id ? (
                      <input className="border p-1 rounded w-full" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
                    ) : (
                      c.phone || '-'
                    )}
                  </td>
                  <td className="p-2 border">
                    {editingId === c.id ? (
                      <div className="flex gap-2">
                        <button onClick={() => saveEdit(c.id)} className="px-2 py-1 bg-green-500 text-white rounded">Save</button>
                        <button onClick={cancelEdit} className="px-2 py-1 bg-gray-300 rounded">Cancel</button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button onClick={() => startEdit(c)} className="px-2 py-1 bg-yellow-500 text-white rounded">Edit</button>
                        <button onClick={() => deleteContact(c.id)} className="px-2 py-1 bg-red-500 text-white rounded">Delete</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-4 flex items-center gap-2">
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="px-3 py-1 bg-gray-200 rounded">Prev</button>
            <div className="text-sm">Page {page} of {pages}</div>
            <button onClick={() => setPage(Math.min(pages, page + 1))} disabled={page === pages} className="px-3 py-1 bg-gray-200 rounded">Next</button>
          </div>
        </>
      )}
    </div>
  );
}
