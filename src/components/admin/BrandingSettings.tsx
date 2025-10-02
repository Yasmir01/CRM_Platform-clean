import React, { useEffect, useState } from 'react';

export default function BrandingSettings() {
  const [form, setForm] = useState({
<<<<<<< HEAD
    name: '',
    logoUrl: '',
    address: '',
    phone: '',
    email: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
=======
    companyName: '',
    logoUrl: '',
    primaryColor: '#3498db',
    secondaryColor: '#ffffff',
    customDomain: '',
    emailSender: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
>>>>>>> ac4b396533b24013bc1866988c2033005cd609c9

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
<<<<<<< HEAD
        const res = await fetch('/api/admin/account', { credentials: 'include' });
=======
        const res = await fetch('/api/branding', { credentials: 'include' });
>>>>>>> ac4b396533b24013bc1866988c2033005cd609c9
        if (!res.ok) return;
        const data = await res.json();
        if (mounted && data) {
          setForm({
<<<<<<< HEAD
            name: data.name || '',
            logoUrl: data.logoUrl || '',
            address: data.address || '',
            phone: data.phone || '',
            email: data.email || '',
=======
            companyName: data.name || '',
            logoUrl: data.logoUrl || '',
            primaryColor: data.primaryColor || '#3498db',
            secondaryColor: data.secondaryColor || '#ffffff',
            customDomain: data.domain || '',
            emailSender: data.emailSender || '',
>>>>>>> ac4b396533b24013bc1866988c2033005cd609c9
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
<<<<<<< HEAD
    setForm({ ...form, [e.target.name]: e.target.value });
=======
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  async function handleFile(file: File | null) {
    if (!file) return;
    setUploading(true);
    try {
      const presignRes = await fetch('/api/storage/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, contentType: file.type }),
      });
      if (!presignRes.ok) throw new Error('Failed to get upload URL');
      const { uploadUrl, key } = await presignRes.json();
      const up = await fetch(uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
      if (!up.ok) throw new Error('Upload failed');
      // store the storage key as logoUrl; backend and frontend will resolve to public URL when rendering
      setForm(prev => ({ ...prev, logoUrl: key }));
    } catch (e) {
      console.error('logo upload failed', e);
      alert('Logo upload failed');
    } finally {
      setUploading(false);
    }
>>>>>>> ac4b396533b24013bc1866988c2033005cd609c9
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
<<<<<<< HEAD
      const res = await fetch('/api/admin/account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
=======
      const payload = {
        companyName: form.companyName || null,
        logoUrl: form.logoUrl || null,
        primaryColor: form.primaryColor || null,
        secondaryColor: form.secondaryColor || null,
        customDomain: form.customDomain || null,
        emailSender: form.emailSender || null,
      };
      const res = await fetch('/api/branding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
>>>>>>> ac4b396533b24013bc1866988c2033005cd609c9
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

<<<<<<< HEAD
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
=======
  if (loading) return <p className="branding-loading">Loading...</p>;

  return (
    <div className="branding-container">
      <h1 className="branding-title">Branding Settings</h1>
      <form onSubmit={handleSubmit} className="branding-form">
        <label className="branding-label">
          Company Name
          <input name="companyName" placeholder="Company Name" value={form.companyName} onChange={handleChange} className="branding-input" />
        </label>

        <label className="branding-label">
          Logo
          <div className="logo-row">
            {form.logoUrl ? <img src={form.logoUrl} alt="logo" className="logo-preview" /> : <div className="logo-placeholder">No logo</div>}
            <input type="file" accept="image/*" onChange={(e) => handleFile(e.target.files ? e.target.files[0] : null)} className="file-input" />
          </div>
        </label>

        <div className="color-row">
          <label className="branding-label">
            Primary Color
            <input type="color" name="primaryColor" value={form.primaryColor} onChange={handleChange} className="color-input" />
          </label>
          <label className="branding-label">
            Secondary Color
            <input type="color" name="secondaryColor" value={form.secondaryColor} onChange={handleChange} className="color-input" />
          </label>
        </div>

        <label className="branding-label">
          Custom Domain (Enterprise only)
          <input name="customDomain" placeholder="portal.example.com" value={form.customDomain} onChange={handleChange} className="branding-input" />
        </label>

        <label className="branding-label">
          Email Sender
          <input name="emailSender" placeholder="noreply@example.com" value={form.emailSender} onChange={handleChange} className="branding-input" />
        </label>

        <div className="branding-actions">
          <button type="submit" disabled={saving || uploading} className="save-button">
            {saving ? 'Saving...' : 'Save Branding'}
          </button>
        </div>

      </form>

      <style jsx>{`
        .branding-container { padding: 32px; max-width: 720px; margin: 0 auto; }
        .branding-title { font-size: 20px; font-weight: 700; margin-bottom: 18px; }
        .branding-form { display: flex; flex-direction: column; gap: 12px; }
        .branding-label { display: flex; flex-direction: column; font-size: 14px; }
        .branding-input { border: 1px solid #e5e7eb; border-radius: 8px; padding: 10px; font-size: 14px; }
        .file-input { margin-top: 8px; }
        .logo-row { display: flex; align-items: center; gap: 12px; margin-top: 8px; }
        .logo-preview { height: 48px; width: auto; border-radius: 6px; }
        .logo-placeholder { height: 48px; width: 120px; display: flex; align-items: center; justify-content: center; background: #f3f4f6; color: #6b7280; border-radius: 6px; }
        .color-row { display: flex; gap: 16px; }
        .color-input { width: 48px; height: 32px; border: none; padding: 0; background: transparent; }
        .branding-actions { margin-top: 18px; }
        .save-button { background: var(--blue, #2563eb); color: white; padding: 10px 16px; border-radius: 8px; border: none; cursor: pointer; }
        .save-button[disabled] { opacity: 0.6; cursor: not-allowed; }

        @media (max-width: 640px) {
          .branding-container { padding: 16px; }
          .color-row { flex-direction: column; }
        }
      `}</style>
>>>>>>> ac4b396533b24013bc1866988c2033005cd609c9
    </div>
  );
}
