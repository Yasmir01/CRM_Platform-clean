"use client";

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

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Contacts</h1>
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
    </div>
  );
}
