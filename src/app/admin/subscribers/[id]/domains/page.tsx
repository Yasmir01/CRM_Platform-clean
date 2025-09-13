"use client";
import React, { useEffect, useState } from "react";

export default function SubscriberDomainsPage({ params }: any) {
  const subscriberId = params?.id;
  const [loading, setLoading] = useState(true);
  const [overrides, setOverrides] = useState<any>({ landingPagesEnabledByAdmin: null, customDomainEnabledByAdmin: null });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!subscriberId) return;
    setLoading(true);
    fetch(`/api/admin/subscribers/${subscriberId}/domains`).then((r) => r.json()).then((data) => {
      setOverrides(data || {});
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [subscriberId]);

  async function save() {
    setSaving(true);
    await fetch(`/api/admin/subscribers/${subscriberId}/domains`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(overrides),
    });
    setSaving(false);
  }

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Subscriber Domain / Landing Page Overrides</h1>
      <div className="mb-4">
        <label className="block mb-1">Force enable landing pages</label>
        <select value={String(overrides.landingPagesEnabledByAdmin ?? 'null')} onChange={(e) => setOverrides({ ...overrides, landingPagesEnabledByAdmin: e.target.value === 'null' ? null : e.target.value === 'true' })} className="border p-2 rounded">
          <option value="null">Follow plan</option>
          <option value="true">Enabled</option>
          <option value="false">Disabled</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block mb-1">Force enable custom domains</label>
        <select value={String(overrides.customDomainEnabledByAdmin ?? 'null')} onChange={(e) => setOverrides({ ...overrides, customDomainEnabledByAdmin: e.target.value === 'null' ? null : e.target.value === 'true' })} className="border p-2 rounded">
          <option value="null">Follow plan</option>
          <option value="true">Enabled</option>
          <option value="false">Disabled</option>
        </select>
      </div>

      <button onClick={save} disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded">{saving ? 'Saving...' : 'Save'}</button>
    </div>
  );
}
