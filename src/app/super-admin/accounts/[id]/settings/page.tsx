"use client";

import React, { useEffect, useState } from "react";

export default function SubscriberSettings({ params }: { params: { id: string } }) {
  const [account, setAccount] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetch(`/api/admin/accounts/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (!mounted) return;
        setAccount(data);
      })
      .catch((e) => console.error(e))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [params.id]);

  async function saveSettings() {
    try {
      const res = await fetch(`/api/admin/accounts/${params.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(account),
      });
      if (!res.ok) throw new Error("Failed to save");
      const updated = await res.json();
      setAccount(updated);
      alert("Settings saved ✅");
    } catch (e) {
      console.error(e);
      alert("Failed to save settings");
    }
  }

  if (loading) return <p className="p-6">Loading...</p>;
  if (!account) return <p className="p-6">Account not found</p>;

  return (
    <div className="p-8">
      <h1 className="text-xl font-bold mb-6">{account.name} – Settings</h1>

      <label className="block mb-4">
        CC Finance Team on Invoice Resend:
        <select
          className="ml-2 border p-1 rounded"
          value={account.ccFinanceOnResend === null || account.ccFinanceOnResend === undefined ? "global" : account.ccFinanceOnResend ? "yes" : "no"}
          onChange={(e) => {
            const val = e.target.value;
            setAccount({
              ...account,
              ccFinanceOnResend: val === "global" ? null : val === "yes" ? true : false,
            });
          }}
        >
          <option value="global">Follow Global Setting</option>
          <option value="yes">Always CC Finance</option>
          <option value="no">Never CC Finance</option>
        </select>
      </label>

      <button onClick={saveSettings} className="bg-blue-600 text-white px-4 py-2 rounded">
        Save
      </button>
    </div>
  );
}
