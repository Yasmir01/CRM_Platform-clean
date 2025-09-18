"use client";

import React, { useState } from 'react';
import SubscriptionControls from '../../dashboard/billing/SubscriptionControls';

export default function LandlordOnboarding() {
  const [step, setStep] = useState(1);
  const [signupError, setSignupError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Signup form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  // Property form state
  const [propertyName, setPropertyName] = useState('');
  const [propertyAddress, setPropertyAddress] = useState('');
  const [unitsCount, setUnitsCount] = useState(1);

  // Invite tenant
  const [tenantEmail, setTenantEmail] = useState('');
  const [tenantName, setTenantName] = useState('');

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setSignupError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, role: 'Landlord' }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d?.error || 'Signup failed');
      setStep(2);
    } catch (err: any) {
      setSignupError(err?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateProperty(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const units = [] as any[];
      for (let i = 0; i < unitsCount; i++) units.push({ number: i + 1, rent: 1000 });
      const res = await fetch('/api/onboarding/property', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: propertyName, address: propertyAddress, units }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d?.error || 'Failed to create property');
      // proceed to invite tenants
      setStep(4);
    } catch (err: any) {
      alert(err?.message || 'Failed to create property');
    } finally {
      setLoading(false);
    }
  }

  async function handleInviteTenant(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/onboarding/invite-tenant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId: (await getLatestPropertyId()), email: tenantEmail, name: tenantName }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d?.error || 'Invite failed');
      alert('Tenant invited');
    } catch (err: any) {
      alert(err?.message || 'Invite failed');
    } finally {
      setLoading(false);
    }
  }

  // Helper to fetch the most recently created property for this user (best-effort)
  async function getLatestPropertyId() {
    try {
      const res = await fetch('/api/properties');
      const d = await res.json();
      if (Array.isArray(d) && d.length) return d[0].id;
    } catch (e) {}
    return undefined;
  }

  return (
    <div className="onboarding max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Landlord Onboarding</h1>

      {step === 1 && (
        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Full name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 block w-full p-2 border rounded" />
          </div>
          {signupError && <div className="text-red-600">{signupError}</div>}
          <div>
            <button disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">Create account</button>
          </div>
        </form>
      )}

      {step === 2 && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Choose a plan</h2>
          <SubscriptionControls />
          <div className="mt-4">
            <button onClick={() => setStep(3)} className="px-4 py-2 bg-gray-200 rounded">Skip for now</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <form onSubmit={handleCreateProperty} className="space-y-4">
          <h2 className="text-xl font-semibold">Add your first property</h2>
          <div>
            <label className="block text-sm font-medium">Property name</label>
            <input value={propertyName} onChange={(e) => setPropertyName(e.target.value)} className="mt-1 block w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium">Address</label>
            <input value={propertyAddress} onChange={(e) => setPropertyAddress(e.target.value)} className="mt-1 block w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium">Number of units</label>
            <input type="number" min={1} value={unitsCount} onChange={(e) => setUnitsCount(Number(e.target.value))} className="mt-1 block w-32 p-2 border rounded" />
          </div>
          <div>
            <button disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">Save Property & Continue</button>
          </div>
        </form>
      )}

      {step === 4 && (
        <form onSubmit={handleInviteTenant} className="space-y-4">
          <h2 className="text-xl font-semibold">Invite a tenant</h2>
          <div>
            <label className="block text-sm font-medium">Tenant name</label>
            <input value={tenantName} onChange={(e) => setTenantName(e.target.value)} className="mt-1 block w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium">Tenant email</label>
            <input value={tenantEmail} onChange={(e) => setTenantEmail(e.target.value)} className="mt-1 block w-full p-2 border rounded" />
          </div>
          <div>
            <button disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">Invite Tenant</button>
          </div>
        </form>
      )}

      {step === 5 && (
        <div>
          <h2 className="text-xl font-semibold">Setup complete</h2>
          <p>You're ready to manage your properties. Take a quick tour to learn the essentials.</p>
        </div>
      )}
    </div>
  );
}
