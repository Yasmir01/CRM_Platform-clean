"use client";

import React, { useEffect, useState } from 'react';
import CompanyForm from '@/components/CompanyForm';

type Company = {
  id: string;
  name: string;
  industry?: string | null;
  website?: string | null;
  contacts: { id: string; name: string }[];
};

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [openForm, setOpenForm] = useState(false);

  const fetchCompanies = async () => {
    try {
      const res = await fetch('/api/companies');
      const data = await res.json();
      setCompanies(data || []);
    } catch (e) {
      setCompanies([]);
    }
  };

  useEffect(() => {
    let mounted = true;
    fetch('/api/companies')
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        setCompanies(data || []);
      })
      .catch(() => setCompanies([]));
    return () => {
      mounted = false;
    };
  }, []);

  const handleSave = async (data: { name: string; industry?: string; website?: string }) => {
    try {
      await fetch('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      fetchCompanies();
    } catch (e) {
      console.error('Create company failed', e);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Companies</h1>
        <button onClick={() => setOpenForm(true)} className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">+ New Company</button>
      </div>

      <table className="min-w-full border border-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 text-left">Name</th>
            <th className="px-4 py-2 text-left">Industry</th>
            <th className="px-4 py-2 text-left">Website</th>
            <th className="px-4 py-2 text-left">Contacts</th>
          </tr>
        </thead>
        <tbody>
          {companies.map((company) => (
            <tr key={company.id} className="border-t">
              <td className="px-4 py-2">{company.name}</td>
              <td className="px-4 py-2">{company.industry || '-'}</td>
              <td className="px-4 py-2">
                {company.website ? (
                  <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{company.website}</a>
                ) : (
                  '-'
                )}
              </td>
              <td className="px-4 py-2">{company.contacts && company.contacts.length > 0 ? company.contacts.map((c) => c.name).join(', ') : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Company modal */}
      <CompanyForm open={openForm} onClose={() => setOpenForm(false)} onSave={handleSave} />
    </div>
  );
}
