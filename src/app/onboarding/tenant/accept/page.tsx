"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function TenantAcceptPage() {
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const token = searchParams ? String(searchParams.get('token') || '') : '';
  const [invite, setInvite] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInvite() {
      if (!token) return;
      try {
        const res = await fetch(`/api/onboarding/get-invite?token=${encodeURIComponent(token)}`);
        const d = await res.json();
        if (!res.ok) throw new Error(d?.error || 'Invite not found');
        setInvite(d);
        setName(d?.name || '');
      } catch (e: any) {
        setError(e?.message || 'Invite not found');
      }
    }
    fetchInvite();
  }, [token]);

  async function handleAccept(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/onboarding/accept-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password, name }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d?.error || 'Accept failed');
      window.location.href = '/tenant/portal';
    } catch (e: any) {
      setError(e?.message || 'Accept failed');
    } finally {
      setLoading(false);
    }
  }

  if (!token) return <div className="p-6">Invalid invite link.</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!invite) return <div className="p-6">Loading invite...</div>;

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">You're invited to Tenant Portal</h1>
      <p className="mb-2">Email: <strong>{invite.email}</strong></p>
      <form onSubmit={handleAccept} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Full name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full p-2 border rounded" />
        </div>
        <div>
          <label className="block text-sm font-medium">Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 block w-full p-2 border rounded" />
        </div>
        <div>
          <button disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">Create Account & Sign In</button>
        </div>
      </form>
    </div>
  );
}
