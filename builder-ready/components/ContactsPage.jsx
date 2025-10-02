import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function ContactsPage() {
  const [contacts, setContacts] = useState([]);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/contacts');
      setContacts(res.data || []);
    } catch (e) {
      setError(e?.message || 'Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  const addContact = async () => {
    try {
      setLoading(true);
      await axios.post('/api/contacts', form);
      setForm({ firstName: '', lastName: '', email: '', phone: '' });
      await fetchContacts();
    } catch (e) {
      setError(e?.message || 'Failed to add contact');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contacts-page p-6">
      <h1 className="contacts-title text-2xl font-bold mb-4">Contacts</h1>

      <div className="contact-form mb-6 space-y-2">
        <input
          className="input-field border p-2 w-full rounded"
          placeholder="First Name"
          value={form.firstName}
          onChange={(e) => setForm({ ...form, firstName: e.target.value })}
        />

        <input
          className="input-field border p-2 w-full rounded"
          placeholder="Last Name"
          value={form.lastName}
          onChange={(e) => setForm({ ...form, lastName: e.target.value })}
        />

        <input
          className="input-field border p-2 w-full rounded"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          className="input-field border p-2 w-full rounded"
          placeholder="Phone"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />

        <button
          className="btn-add bg-blue-600 text-white px-4 py-2 rounded"
          onClick={addContact}
          disabled={loading}
        >
          Add Contact
        </button>

        {error && <div className="error-text text-red-600 text-sm mt-2">{error}</div>}
      </div>

      <div className="contacts-list space-y-2">
        {loading ? (
          <p>Loading contacts…</p>
        ) : contacts.length === 0 ? (
          <p>No contacts found.</p>
        ) : (
          <ul>
            {contacts.map((c) => (
              <li key={c.id} className="contact-item p-3 border rounded flex justify-between">
                <div>
                  <div className="contact-name font-medium">{c.firstName} {c.lastName}</div>
                  <div className="contact-email text-sm text-gray-600">{c.email}</div>
                </div>
                <div className="company-name text-sm text-gray-600">{c.company?.name || '—'}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
