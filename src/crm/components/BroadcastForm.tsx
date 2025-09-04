import * as React from 'react';

export default function BroadcastForm() {
  const [role, setRole] = React.useState<string>('');
  const [propertyId, setPropertyId] = React.useState<string>('');
  const [content, setContent] = React.useState<string>('');
  const [busy, setBusy] = React.useState<boolean>(false);

  const sendBroadcast = async () => {
    if (!content.trim()) return;
    setBusy(true);
    try {
      const payload: Record<string, any> = { content: content.trim() };
      if (role) payload.targetRole = role; // accepted values: TENANT | OWNER | MANAGER (case-insensitive)
      if (propertyId.trim()) payload.propertyId = propertyId.trim();

      const res = await fetch('/api/messages/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err?.error || 'Failed to send broadcast');
        return;
      }
      setContent('');
      alert('Broadcast sent!');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="broadcast-form p-4 border rounded bg-white space-y-4 shadow">
      <h2 className="text-lg font-bold">Broadcast Message</h2>

      <div className="target-role-group">
        <label className="block font-medium">Target Role</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="border p-2 rounded w-full"
        >
          <option value="">All Users</option>
          <option value="TENANT">Tenants</option>
          <option value="OWNER">Owners</option>
          <option value="MANAGER">Managers</option>
        </select>
      </div>

      <div className="property-filter-group">
        <label className="block font-medium">Property (optional)</label>
        <input
          type="text"
          value={propertyId}
          onChange={(e) => setPropertyId(e.target.value)}
          placeholder="Enter Property ID (leave blank for all)"
          className="border p-2 rounded w-full"
        />
      </div>

      <div className="message-content-group">
        <label className="block font-medium">Message</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type your announcement..."
          className="border p-2 rounded w-full"
        />
      </div>

      <button
        onClick={sendBroadcast}
        disabled={busy}
        className="w-full px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        {busy ? 'Sending…' : 'Send Broadcast'}
      </button>
    </div>
  );
}
