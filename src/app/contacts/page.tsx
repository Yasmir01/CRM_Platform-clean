"use client";

import { useEffect, useState } from "react";

export default function ContactsPage() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const LIMIT = 10;

  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState<'asc'|'desc'>('desc');

  useEffect(() => {
    setLoading(true);
    fetch(`/api/contacts?page=${page}&limit=${LIMIT}&sortBy=${encodeURIComponent(sortBy)}&order=${order}`)
      .then((res) => res.json())
      .then((data) => {
        setContacts(data.contacts || []);
        setTotalPages(data.totalPages || 1);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [page, sortBy, order]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Contacts</h1>

      {loading ? (
        <p>Loading contacts...</p>
      ) : (
        <table className="w-full border rounded shadow-sm">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-2">Name</th>
              <th className="p-2">Email</th>
              <th className="p-2">Company</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((contact) => (
              <tr key={contact.id} className="border-t">
                <td className="p-2">{contact.name || `${contact.firstName || ''} ${contact.lastName || ''}`.trim()}</td>
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
