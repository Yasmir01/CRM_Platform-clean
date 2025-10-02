"use client";

<<<<<<< HEAD
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
=======
import { useEffect, useState } from "react";
import { useSession } from '@/auth/useSession';

type Company = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  industry?: string;
  website?: string;
  address?: string;
  createdAt: string;
};

export default function CompaniesPage() {
  const sess = useSession();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Company | null>(null);
  const [formData, setFormData] = useState({ name: "", industry: "", website: "", email: "", phone: "", address: "" });

  const isLoadingSession = (sess as any).loading;
  const user = (sess as any).user;
  const isSuper = Boolean(user && ((user.roles && user.roles.includes('SUPER_ADMIN')) || user.role === 'SUPER_ADMIN'));

  const [debouncedSearch, setDebouncedSearch] = useState(search);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
      if (debouncedSearch) params.set("search", debouncedSearch);

      const res = await fetch(`/api/companies?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch companies");
      const json = await res.json();
      setCompanies(json.data ?? json.items ?? []);
      setTotal(json.total ?? 0);
    } catch (err) {
      console.error("Failed to fetch companies", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // reset page when pageSize changes handled elsewhere; here we fetch on debouncedSearch/page/pageSize
    fetchCompanies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, debouncedSearch]);

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const validateEmail = (value?: string) => {
    if (!value) return true;
    return /^\S+@\S+\.\S+$/.test(value);
  };
  const validatePhone = (value?: string) => {
    if (!value) return true;
    return /^[0-9+()\-\s]+$/.test(value);
  };

  const handleSubmit = async () => {
    setFormError(null);

    if (!formData.name || !formData.name.trim()) {
      setFormError('Name is required');
      return;
    }
    if (!validateEmail(formData.email)) {
      setFormError('Please enter a valid email address');
      return;
    }
    if (!validatePhone(formData.phone)) {
      setFormError('Please enter a valid phone number');
      return;
    }

    setSubmitting(true);
    try {
      if (editing) {
        const res = await fetch(`/api/companies/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => null);
          throw new Error(err?.error || 'Failed to update');
        }
      } else {
        const res = await fetch("/api/companies", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => null);
          throw new Error(err?.error || 'Failed to create');
        }
      }
      setShowForm(false);
      setEditing(null);
      setFormData({ name: "", industry: "", website: "", email: "", phone: "", address: "" });
      fetchCompanies();
      // Success feedback via notifications if available
      try {
        if (toasts) toasts.showSuccess('Saved', 'Company saved');
        else { try { window.alert('Company saved'); } catch (e) {} }
      } catch (e) { /* ignore */ }
    } catch (err: any) {
      console.error("Failed to save company", err);
      setFormError(err?.message || 'Failed to save company');
    } finally {
      setSubmitting(false);
    }
  };

  // Notifications (toasts)
  const toasts = ((): any => {
    try {
      // import hook dynamically to avoid import-time issues
      // eslint-disable-next-line global-require
      return require('../../crm/components/GlobalNotificationProvider').useNotifications();
    } catch (e) {
      return null;
    }
  })();

  const handleDelete = async (id: string) => {
    if (!toasts) {
      if (!confirm("Are you sure you want to delete this company?")) return;
    } else {
      // show a warning with confirm action
      toasts.showWarning(
        'Confirm delete',
        'Are you sure you want to delete this company? This action cannot be undone.',
        [
          {
            id: 'confirm-delete',
            label: 'Delete',
            action: async () => {
              try {
                const res = await fetch(`/api/companies/${id}`, { method: 'DELETE' });
                if (!res.ok && res.status !== 204) throw new Error('Failed to delete');
                toasts.showSuccess('Deleted', 'Company deleted');
                if (companies.length === 1 && page > 1) setPage((p) => p - 1);
                else fetchCompanies();
              } catch (err) {
                console.error('Failed to delete company', err);
                toasts.showError('Delete failed', String(err?.message || err));
              }
            },
            variant: 'contained',
          },
          { id: 'cancel', label: 'Cancel', action: () => {}, variant: 'text' },
        ]
      );
      return;
    }

    try {
      const res = await fetch(`/api/companies/${id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) throw new Error("Failed to delete");
      // adjust page if needed
      if (companies.length === 1 && page > 1) setPage((p) => p - 1);
      else fetchCompanies();
    } catch (err) {
      console.error("Failed to delete company", err);
    }
  };

  const totalPages = Math.ceil(total / pageSize) || 1;

  if (isLoadingSession) return <p>Loading...</p>;

  return (
    <div className="companies-page p-6">
      <h1 className="companies-title text-2xl font-bold mb-4">Companies</h1>

      {/* Actions */}
      <div className="companies-actions flex items-center justify-between mb-4">
>>>>>>> ac4b396533b24013bc1866988c2033005cd609c9
        <input
          type="text"
          placeholder="Search companies..."
          value={search}
<<<<<<< HEAD
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
=======
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          className="companies-search-input border rounded p-2 w-1/2"
        />
        <div className="companies-controls flex items-center gap-2">
          <select
            value={pageSize}
            onChange={(e) => {
              setPage(1);
              setPageSize(Number(e.target.value));
            }}
            className="companies-page-size-select border rounded p-2"
          >
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
          </select>
          {isSuper && (
            <button
              onClick={() => {
                setEditing(null);
                setFormData({ name: "", industry: "", website: "" });
                setShowForm(true);
              }}
              className="companies-add-button bg-blue-600 text-white px-4 py-2 rounded"
            >
              + Add Company
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="companies-table-wrap overflow-x-auto">
        <table className="companies-table min-w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 border text-left">Name</th>
              <th className="px-4 py-2 border text-left">Email</th>
              <th className="px-4 py-2 border text-left">Phone</th>
              <th className="px-4 py-2 border text-left">Industry</th>
              <th className="px-4 py-2 border text-left">Website</th>
              <th className="px-4 py-2 border text-left">Address</th>
              <th className="px-4 py-2 border text-left">Created</th>
              {isSuper && <th className="px-4 py-2 border text-left">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={isSuper ? 5 : 4} className="text-center py-4">Loading...</td>
              </tr>
            ) : companies.length === 0 ? (
              <tr>
                <td colSpan={isSuper ? 5 : 4} className="text-center py-4">No companies found</td>
              </tr>
            ) : (
              companies.map((company) => (
                <tr key={company.id} className="companies-row">
                  <td className="px-4 py-2 border">{company.name}</td>
                  <td className="px-4 py-2 border">{company.email || "-"}</td>
                  <td className="px-4 py-2 border">{company.phone || "-"}</td>
                  <td className="px-4 py-2 border">{company.industry || "-"}</td>
                  <td className="px-4 py-2 border">
                    {company.website ? (
                      <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                        {company.website}
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="px-4 py-2 border">{company.address || "-"}</td>
                  <td className="px-4 py-2 border">{new Date(company.createdAt).toLocaleDateString()}</td>
                  {isSuper && (
                    <td className="px-4 py-2 border flex gap-2">
                      <button
                        onClick={() => {
                          setEditing(company);
                          setFormData({ name: company.name, industry: company.industry ?? "", website: company.website ?? "", email: company.email ?? "", phone: company.phone ?? "", address: company.address ?? "" });
                          setShowForm(true);
                        }}
                        className="companies-edit-button bg-yellow-500 text-white px-3 py-1 rounded"
                      >
                        Edit
                      </button>
                      <button onClick={() => handleDelete(company.id)} className="companies-delete-button bg-red-600 text-white px-3 py-1 rounded">Delete</button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="companies-pagination flex justify-between items-center mt-4">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page === 1}
          className="companies-prev-button px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          Prev
        </button>
        <span className="companies-page-info">Page {page} of {totalPages}</span>
        <button
          onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          disabled={page === totalPages || totalPages === 0}
          className="companies-next-button px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="companies-modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="companies-modal-panel bg-white p-6 rounded shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">{editing ? "Edit Company" : "Add Company"}</h2>
            <input
              type="text"
              placeholder="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="companies-input border rounded p-2 mb-2 w-full"
            />
            <input
              type="text"
              placeholder="Industry"
              value={formData.industry}
              onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              className="companies-input border rounded p-2 mb-2 w-full"
            />
            <input
              type="text"
              placeholder="Website"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              className="companies-input border rounded p-2 mb-2 w-full"
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="companies-input border rounded p-2 mb-2 w-full"
            />
            <input
              type="text"
              placeholder="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="companies-input border rounded p-2 mb-2 w-full"
            />
            <input
              type="text"
              placeholder="Address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="companies-input border rounded p-2 mb-4 w-full"
            />
            {formError && <div className="text-sm text-red-600 mb-2">{formError}</div>}
            <div className="flex justify-end gap-2">
              <button onClick={() => { setShowForm(false); setEditing(null); }} className="companies-cancel-button px-4 py-2 bg-gray-300 rounded">Cancel</button>
              <button onClick={handleSubmit} disabled={submitting} className={`companies-save-button px-4 py-2 text-white rounded ${submitting ? 'bg-gray-400' : 'bg-blue-600'}`}>
                {submitting ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
>>>>>>> ac4b396533b24013bc1866988c2033005cd609c9
    </div>
  );
}
