"use client";

import { useState, useEffect } from "react";

export default function NotificationSettingsPage() {
  const [settings, setSettings] = useState({ notifyEmail: true, notifySMS: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSettings() {
      const res = await fetch("/api/subscriber/notifications");
      if (res.ok) {
        const data = await res.json();
        setSettings({ notifyEmail: data.notifyEmail ?? true, notifySMS: data.notifySMS ?? false });
      }
      setLoading(false);
    }
    fetchSettings();
  }, []);

  const updateSettings = async () => {
    await fetch("/api/subscriber/notifications", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    alert("Settings updated!");
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-2xl font-bold mb-4">Notification Settings</h1>
      <div className="space-y-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={settings.notifyEmail}
            onChange={(e) => setSettings({ ...settings, notifyEmail: e.target.checked })}
          />
          Enable Email Notifications
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={settings.notifySMS}
            onChange={(e) => setSettings({ ...settings, notifySMS: e.target.checked })}
          />
          Enable SMS Notifications
        </label>
      </div>
      <button onClick={updateSettings} className="mt-6 px-4 py-2 bg-blue-600 text-white rounded">
        Save Settings
      </button>
    </div>
  );
}
