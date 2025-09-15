import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface Company {
  id: string;
  name: string;
  domain: string | null;
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', domain: '' });

  async function fetchCompanies() {
    setLoading(true);
    try {
      const res = await fetch('/api/companies');
      const data = await res.json();
      setCompanies(data || []);
    } catch (e) {
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  }

  async function createCompany(e: React.FormEvent) {
    e.preventDefault();
    try {
      await fetch('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setForm({ name: '', domain: '' });
      fetchCompanies();
    } catch (err) {
      console.error('Create company error', err);
    }
  }

  async function deleteCompany(id: string) {
    try {
      await fetch('/api/companies', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      fetchCompanies();
    } catch (err) {
      console.error('Delete company error', err);
    }
  }

  useEffect(() => {
    fetchCompanies();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Companies</h1>

      <form onSubmit={createCompany} className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="Company name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="border p-2 rounded flex-1"
          required
        />
        <input
          type="text"
          placeholder="Domain"
          value={form.domain}
          onChange={(e) => setForm({ ...form, domain: e.target.value })}
          className="border p-2 rounded flex-1"
        />
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
          Add
        </button>
      </form>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="min-w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Domain</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((c) => (
              <tr key={c.id}>
                <td className="p-2 border">
                  <Link href={`/companies/${c.id}`} className="text-blue-600 hover:underline">{c.name}</Link>
                </td>
                <td className="p-2 border">{c.domain}</td>
                <td className="p-2 border">
                  <button
                    onClick={() => deleteCompany(c.id)}
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
