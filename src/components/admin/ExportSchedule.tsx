import { useEffect, useState } from 'react';

export default function ExportSchedule() {
  const [schedule, setSchedule] = useState('daily');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/settings/export-schedule', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        setSchedule(d.schedule || 'daily');
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function save() {
    await fetch('/api/admin/settings/export-schedule', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ schedule }),
    });
    alert('Export schedule updated!');
  }

  if (loading) return null;

  return (
    <div className="p-4 border rounded bg-gray-50 mt-6">
      <h2 className="font-bold mb-2">Report Export Schedule</h2>
      <select
        value={schedule}
        onChange={(e) => setSchedule(e.target.value)}
        className="border p-2 rounded"
      >
        <option value="daily">Daily</option>
        <option value="weekly">Weekly</option>
        <option value="monthly">Monthly</option>
      </select>
      <button onClick={save} className="ml-3 px-3 py-1 bg-indigo-600 text-white rounded">
        Save
      </button>
    </div>
  );
}
