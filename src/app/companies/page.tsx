"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/companies')
      .then((res) => res.json())
      .then(setCompanies)
      .catch(() => setCompanies([]));
  }, []);

  const filtered = companies.filter((c) =>
    `${c.name} ${c.domain || ''} ${c.industry || ''}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Companies</h1>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Search companies..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-2 py-1 rounded flex-1"
        />
        <Link href="/companies/new" className="px-3 py-1 bg-green-500 text-white rounded">
          + New Company
        </Link>
      </div>

      <table className="min-w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-3 py-2 border text-left">Name</th>
            <th className="px-3 py-2 border text-left">Domain</th>
            <th className="px-3 py-2 border text-left">Industry</th>
            <th className="px-3 py-2 border text-left">Contacts</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((c) => (
            <tr key={c.id} className="hover:bg-gray-50">
              <td className="px-3 py-2 border">
                <Link href={`/companies/${c.id}`} className="text-blue-600 hover:underline">{c.name}</Link>
              </td>
              <td className="px-3 py-2 border">{c.domain || '-'}</td>
              <td className="px-3 py-2 border">{c.industry || '-'}</td>
              <td className="px-3 py-2 border">{c._count?.contacts ?? (c.contacts? c.contacts.length : 0)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
