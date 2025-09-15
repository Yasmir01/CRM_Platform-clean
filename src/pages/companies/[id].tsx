import React, { useEffect, useState } from 'react';
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

  if (loading) return <p className="p-6">Loading...</p>;

  if (!company) return <p className="p-6">Company not found</p>;

  return (
    <div className="p-6">
      <button onClick={() => router.push('/companies')} className="mb-4 px-3 py-1 bg-gray-200 rounded">← Back to Companies</button>

      <h1 className="text-2xl font-bold mb-2">{company.name}</h1>
      {company.domain && <p className="mb-4 text-gray-600">Domain: {company.domain}</p>}

      <h2 className="text-xl font-semibold mb-2">Contacts</h2>
      {contacts.length === 0 ? (
        <p>No contacts linked to this company.</p>
      ) : (
        <table className="min-w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Phone</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((c) => (
              <tr key={c.id}>
                <td className="p-2 border">{c.firstName} {c.lastName}</td>
                <td className="p-2 border">{c.email}</td>
                <td className="p-2 border">{c.phone || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
