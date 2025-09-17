"use client";

import { useEffect, useState } from "react";
import { displayContactName } from '@/crm/utils/contactDisplay';

export default function ContactsPage() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [pageSize, setPageSize] = useState(10);

  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState<'asc'|'desc'>('desc');

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

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Contacts</h1>

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
              <th className="px-4 py-2 cursor-pointer" onClick={() => {
                if (sortBy === 'companyId' || sortBy === 'company') setOrder(order === 'asc' ? 'desc' : 'asc'); else { setSortBy('company'); setOrder('asc'); }
              }}>
                Company { (sortBy === 'company' || sortBy === 'companyId') && (order === 'asc' ? '↑' : '↓')}
              </th>
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
                <td className="p-2">{contact.company?.name || "—"}</td>
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
    </div>
  );
}
