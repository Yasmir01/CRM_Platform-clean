import React, { useEffect, useState } from 'react';

export default function BrandingSettings() {
  const [form, setForm] = useState({
    name: '',
    logoUrl: '',
    address: '',
    phone: '',
    email: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/admin/account', { credentials: 'include' });
        if (!res.ok) return;
        const data = await res.json();
        if (mounted && data) {
          setForm({
            name: data.name || '',
            logoUrl: data.logoUrl || '',
            address: data.address || '',
            phone: data.phone || '',
            email: data.email || '',
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed to save');
      alert('Branding updated ✅');
    } catch (err) {
      console.error(err);
      alert('Failed to save branding');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Branding Settings</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="name" placeholder="Company Name" value={form.name} onChange={handleChange} className="border rounded px-3 py-2 w-full" />
        <input name="logoUrl" placeholder="Logo URL" value={form.logoUrl} onChange={handleChange} className="border rounded px-3 py-2 w-full" />
        <input name="address" placeholder="Address" value={form.address} onChange={handleChange} className="border rounded px-3 py-2 w-full" />
        <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} className="border rounded px-3 py-2 w-full" />
        <input name="email" placeholder="Email" value={form.email} onChange={handleChange} className="border rounded px-3 py-2 w-full" />
        <div>
          <button type="submit" disabled={saving} className="bg-blue-600 text-white px-4 py-2 rounded-lg">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
