"use client";

import { useState, useEffect } from "react";

export default function AdminNotificationControls({ params }: { params: { id: string } }) {
  const [subscriber, setSubscriber] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      const res = await fetch(`/api/admin/subscribers/${params.id}/notifications`);
      if (res.ok) setSubscriber(await res.json());
    }
    fetchData();
  }, [params.id]);

  const update = async () => {
    await fetch(`/api/admin/subscribers/${params.id}/notifications`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(subscriber),
    });
    alert("Settings updated by Super Admin!");
  };

  if (!subscriber) return <p>Loading...</p>;

  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-2xl font-bold mb-4">Super Admin: Override Notifications</h1>

      <div className="space-y-4">
        <div>
          <div className="font-medium">Subscriber: {subscriber.name} (plan: {subscriber.plan})</div>
        </div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={subscriber.emailEnabledByAdmin}
            onChange={(e) => setSubscriber({ ...subscriber, emailEnabledByAdmin: e.target.checked })}
          />
          Allow Email Notifications
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={subscriber.smsEnabledByAdmin}
            onChange={(e) => setSubscriber({ ...subscriber, smsEnabledByAdmin: e.target.checked })}
          />
          Allow SMS Notifications
        </label>
      </div>

      <button onClick={update} className="mt-6 px-4 py-2 bg-red-600 text-white rounded">
        Save Overrides
      </button>
    </div>
  );
}
