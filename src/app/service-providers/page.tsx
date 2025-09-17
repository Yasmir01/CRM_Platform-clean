"use client";

import React, { useEffect, useState } from "react";
import { useSession } from '@/auth/useSession';

type ServiceProvider = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  service?: string;
  notes?: string;
  createdAt: string;
};

export default function ServiceProvidersPage() {
  const sess = useSession();
  const isLoadingSession = (sess as any).loading;
  const user = (sess as any).user;
  const isSuper = Boolean(user && ((user.roles && user.roles.includes('SUPER_ADMIN')) || user.role === 'SUPER_ADMIN'));

  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ServiceProvider | null>(null);
  const [formData, setFormData] = useState<Partial<ServiceProvider>>({ name: "", email: "", phone: "", service: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/service-providers');
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      setProviders(data || []);
    } catch (err) {
      console.error('Failed to load providers', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProviders(); }, []);

  const openModal = (p?: ServiceProvider) => {
    if (p) setFormData({ ...p });
    else setFormData({ name: "", email: "", phone: "", service: "", notes: "" });
    setEditing(p || null);
    setFormError(null);
    setShowForm(true);
  };

  const validateEmail = (v?: string) => { if (!v) return true; return /^\S+@\S+\.\S+$/.test(v); };
  const validatePhone = (v?: string) => { if (!v) return true; return /^[0-9+()\-\s]+$/.test(v); };

  const handleSave = async () => {
    setFormError(null);
    if (!formData.name || !String(formData.name).trim()) { setFormError('Name is required'); return; }
    if (!validateEmail(formData.email as any)) { setFormError('Invalid email'); return; }
    if (!validatePhone(formData.phone as any)) { setFormError('Invalid phone'); return; }

    setSubmitting(true);
    try {
      if (editing) {
        const res = await fetch(`/api/service-providers/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
        if (!res.ok) { const e = await res.json().catch(() => null); throw new Error(e?.error || 'Failed to update'); }
      } else {
        const res = await fetch('/api/service-providers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
        if (!res.ok) { const e = await res.json().catch(() => null); throw new Error(e?.error || 'Failed to create'); }
      }
      setShowForm(false);
      setEditing(null);
      setFormData({ name: "", email: "", phone: "", service: "", notes: "" });
      fetchProviders();
      try { window.alert('Saved'); } catch(e){}
    } catch (err: any) {
      console.error('Save failed', err);
      setFormError(err?.message || 'Save failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this service provider?')) return;
    try {
      const res = await fetch(`/api/service-providers/${id}`, { method: 'DELETE' });
      if (!res.ok && res.status !== 204) throw new Error('Failed to delete');
      fetchProviders();
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  if (isLoadingSession) return <p>Loading...</p>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Service Providers</h1>
        {isSuper && <button onClick={() => openModal()} className="px-4 py-2 bg-blue-600 text-white rounded">+ Add</button>}
      </div>

      {loading ? <p>Loading...</p> : (
        <div className="overflow-x-auto">
          <table className="min-w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 border text-left">Name</th>
                <th className="px-4 py-2 border text-left">Email</th>
                <th className="px-4 py-2 border text-left">Phone</th>
                <th className="px-4 py-2 border text-left">Service</th>
                <th className="px-4 py-2 border text-left">Notes</th>
                <th className="px-4 py-2 border text-left">Created</th>
                {isSuper && <th className="px-4 py-2 border text-left">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {providers.length === 0 ? (
                <tr><td colSpan={isSuper ? 7 : 6} className="text-center py-4">No service providers found</td></tr>
              ) : providers.map(p => (
                <tr key={p.id} className="border-t">
                  <td className="px-4 py-2">{p.name}</td>
                  <td className="px-4 py-2">{p.email || '-'}</td>
                  <td className="px-4 py-2">{p.phone || '-'}</td>
                  <td className="px-4 py-2">{p.service || '-'}</td>
                  <td className="px-4 py-2">{p.notes || '-'}</td>
                  <td className="px-4 py-2">{new Date(p.createdAt).toLocaleDateString()}</td>
                  {isSuper && (
                    <td className="px-4 py-2 flex gap-2">
                      <button onClick={() => openModal(p)} className="px-3 py-1 bg-yellow-500 text-white rounded">Edit</button>
                      <button onClick={() => handleDelete(p.id)} className="px-3 py-1 bg-red-600 text-white rounded">Delete</button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">{editing ? 'Edit Provider' : 'Add Provider'}</h2>
            {formError && <div className="text-sm text-red-600 mb-2">{formError}</div>}
            <input type="text" placeholder="Name" value={formData.name || ''} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full border p-2 rounded mb-2" />
            <input type="email" placeholder="Email" value={formData.email || ''} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full border p-2 rounded mb-2" />
            <input type="text" placeholder="Phone" value={formData.phone || ''} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full border p-2 rounded mb-2" />
            <input type="text" placeholder="Service (e.g. Plumbing)" value={formData.service || ''} onChange={(e) => setFormData({...formData, service: e.target.value})} className="w-full border p-2 rounded mb-2" />
            <textarea placeholder="Notes" value={formData.notes || ''} onChange={(e) => setFormData({...formData, notes: e.target.value})} className="w-full border p-2 rounded mb-4" />
            <div className="flex justify-end gap-2">
              <button onClick={() => { setShowForm(false); setEditing(null); }} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
              <button onClick={handleSave} disabled={submitting} className={`px-4 py-2 text-white rounded ${submitting ? 'bg-gray-400' : 'bg-blue-600'}`}>{submitting ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
