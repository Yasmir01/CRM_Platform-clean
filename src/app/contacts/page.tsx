"use client";

<<<<<<< HEAD
import React, { useEffect, useState } from 'react';

interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: { id: string; name: string } | null;
  notes?: string;
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    fetch('/api/contacts')
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        const list = (data || []).map((item: any) => ({
          id: item.id,
          name: `${item.firstName || ''} ${item.lastName || ''}`.trim(),
          email: item.email,
          phone: item.phone || '',
          company: item.company || null,
          notes: item.notes && item.notes.length ? item.notes[0]?.content || '' : '',
        }));
        setContacts(list);
      })
      .catch(() => setContacts([]))
      .finally(() => setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const handleSave = async () => {
    if (!selectedContact) return;
    try {
      // split name into first/last
      const [firstName, ...rest] = (selectedContact.name || '').split(' ');
      const lastName = rest.join(' ');
      const res = await fetch(`/api/contacts/${selectedContact.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email: selectedContact.email, phone: selectedContact.phone }),
      });
      if (!res.ok) throw new Error('Failed to save');
      const updated = await res.json();
      setContacts((prev) => prev.map((c) => (c.id === updated.id ? { ...c, name: `${updated.firstName || firstName} ${updated.lastName || lastName}`, email: updated.email, phone: updated.phone } : c)));
      setIsModalOpen(false);
      setSelectedContact(null);
    } catch (e) {
      console.error('Failed saving contact', e);
    }
  };

  if (loading) return <p className="p-6">Loading contacts...</p>;
=======
import { useEffect, useState } from "react";
import { displayContactName } from '@/crm/utils/contactDisplay';
import { useSession } from '@/auth/useSession';

export default function ContactsPage() {
  const sess = useSession();
  const [contacts, setContacts] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [pageSize, setPageSize] = useState(10);

  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState<'asc'|'desc'>('desc');

  const isLoadingSession = (sess as any).loading;
  const user = (sess as any).user;
  const isSuper = Boolean(user && ((user.roles && user.roles.includes('SUPER_ADMIN')) || user.role === 'SUPER_ADMIN'));

  useEffect(() => {
    setLoading(true);
    fetch(`/api/contacts?page=${page}&limit=${pageSize}&sortBy=${encodeURIComponent(sortBy)}&order=${order}`)
      .then((res) => res.json())
      .then((data) => {
        setContacts(data.contacts || []);
        setTotalPages(data.totalPages || 1);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [page, sortBy, order, pageSize]);

  if (isLoadingSession) return <p>Loading...</p>;
>>>>>>> ac4b396533b24013bc1866988c2033005cd609c9

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Contacts</h1>
<<<<<<< HEAD
      <table className="min-w-full border rounded">
        <thead>
          <tr className="bg-gray-100 text-left">
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
              <td className="p-2 border">{c.name}</td>
              <td className="p-2 border">{c.email}</td>
              <td className="p-2 border">{c.phone || '-'}</td>
              <td className="p-2 border">{c.company?.name || '-'}</td>
              <td className="p-2 border">
                <button
                  onClick={() => {
                    setSelectedContact(c);
                    setIsModalOpen(true);
                  }}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal (simple) */}
      {isModalOpen && selectedContact && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h2 className="text-xl font-semibold mb-4">Edit Contact</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSave();
              }}
              className="space-y-3"
            >
              <input
                type="text"
                value={selectedContact.name}
                onChange={(e) => setSelectedContact({ ...selectedContact, name: e.target.value })}
                placeholder="Name"
                className="w-full border p-2 rounded"
              />
              <input
                type="email"
                value={selectedContact.email}
                onChange={(e) => setSelectedContact({ ...selectedContact, email: e.target.value })}
                placeholder="Email"
                className="w-full border p-2 rounded"
              />
              <input
                type="text"
                value={selectedContact.phone || ''}
                onChange={(e) => setSelectedContact({ ...selectedContact, phone: e.target.value })}
                placeholder="Phone"
                className="w-full border p-2 rounded"
              />
              <textarea
                value={selectedContact.notes || ''}
                onChange={(e) => setSelectedContact({ ...selectedContact, notes: e.target.value })}
                placeholder="Notes"
                className="w-full border p-2 rounded"
              />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => { setIsModalOpen(false); setSelectedContact(null); }} className="px-3 py-1 bg-gray-200 rounded">
                  Cancel
                </button>
                <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
=======

      {isSuper && (
        <button className="px-4 py-2 mb-4 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700" onClick={() => alert('TODO: Add Contact Form')}>
          + Add Contact
        </button>
      )}

      <div className="mb-4 flex items-center justify-between">
        {/* Page Size Selector */}
        <div className="flex items-center space-x-2">
          <label htmlFor="pageSize" className="text-sm text-gray-700">Rows per page:</label>
          <select
            id="pageSize"
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
            className="border rounded-md px-2 py-1 text-sm"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {loading ? (
        <p>Loading contacts...</p>
      ) : (
        <table className="w-full border rounded shadow-sm">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="px-4 py-2 cursor-pointer" onClick={() => {
                if (sortBy === 'name') setOrder(order === 'asc' ? 'desc' : 'asc'); else { setSortBy('name'); setOrder('asc'); }
              }}>
                Name {sortBy === 'name' && (order === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-4 py-2 cursor-pointer" onClick={() => {
                if (sortBy === 'email') setOrder(order === 'asc' ? 'desc' : 'asc'); else { setSortBy('email'); setOrder('asc'); }
              }}>
                Email {sortBy === 'email' && (order === 'asc' ? '↑' : '↓')}
              </th>

              {isSuper && (
                <th className="px-4 py-2 cursor-pointer" onClick={() => {
                  if (sortBy === 'companyId' || sortBy === 'company') setOrder(order === 'asc' ? 'desc' : 'asc'); else { setSortBy('company'); setOrder('asc'); }
                }}>
                  Company { (sortBy === 'company' || sortBy === 'companyId') && (order === 'asc' ? '↑' : '↓')}
                </th>
              )}

              <th className="px-4 py-2 cursor-pointer" onClick={() => {
                if (sortBy === 'createdAt') setOrder(order === 'asc' ? 'desc' : 'asc'); else { setSortBy('createdAt'); setOrder('asc'); }
              }}>
                Created {sortBy === 'createdAt' && (order === 'asc' ? '↑' : '↓')}
              </th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((contact) => (
              <tr key={contact.id} className="border-t">
                <td className="p-2">{displayContactName(contact)}</td>
                <td className="p-2">{contact.email}</td>
                {isSuper && <td className="p-2">{contact.company?.name || "—"}</td>}
                <td className="p-2">{new Date(contact.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
        <button
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          disabled={page === 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          Previous
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          disabled={page === totalPages}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
        >
          Next
        </button>
      </div>
>>>>>>> ac4b396533b24013bc1866988c2033005cd609c9
    </div>
  );
}
