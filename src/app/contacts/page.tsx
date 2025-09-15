"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ContactsPage() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/contacts')
      .then((res) => res.json())
      .then(setContacts)
      .catch(() => setContacts([]));
  }, []);

  const filtered = contacts.filter((c) =>
    `${c.firstName} ${c.lastName} ${c.email || ''}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Contacts</h1>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Search contacts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-2 py-1 rounded flex-1"
        />
        <Link href="/contacts/new" className="px-3 py-1 bg-blue-500 text-white rounded">
          + New Contact
        </Link>
      </div>

      <table className="min-w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-3 py-2 border text-left">Name</th>
            <th className="px-3 py-2 border text-left">Email</th>
            <th className="px-3 py-2 border text-left">Company</th>
            <th className="px-3 py-2 border text-left">Owner</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((c) => (
            <tr key={c.id} className="hover:bg-gray-50">
              <td className="px-3 py-2 border">
                <Link href={`/contacts/${c.id}`} className="text-blue-600 hover:underline">
                  {c.firstName} {c.lastName}
                </Link>
              </td>
              <td className="px-3 py-2 border">{c.email || '-'}</td>
              <td className="px-3 py-2 border">{c.company?.name || '-'}</td>
              <td className="px-3 py-2 border">{c.owner?.email || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
