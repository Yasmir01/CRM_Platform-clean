import React, { useEffect, useState } from 'react';

export default function ReportSettings() {
  const [frequency, setFrequency] = useState('none');
  const [format, setFormat] = useState('pdf');
  const [loading, setLoading] = useState(true);

  async function fetchPrefs() {
    try {
      const res = await fetch('/api/report-preferences');
      const data = await res.json();
      if (res.ok && data.pref) {
        setFrequency(data.pref.frequency || 'none');
        setFormat(data.pref.format || 'pdf');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function savePrefs() {
    try {
      await fetch('/api/report-preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ frequency, format }),
      });
      alert('Preferences saved ✅');
    } catch (err) {
      console.error(err);
      alert('Failed to save preferences');
    }
  }

  useEffect(() => {
    fetchPrefs();
  }, []);

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Report Preferences</h1>

      <div className="space-y-4">
        <div>
          <label className="block font-medium">Frequency</label>
          <select className="border rounded-md px-3 py-2 w-full" value={frequency} onChange={(e) => setFrequency(e.target.value)}>
            <option value="none">None</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        <div>
          <label className="block font-medium">Format</label>
          <select className="border rounded-md px-3 py-2 w-full" value={format} onChange={(e) => setFormat(e.target.value)}>
            <option value="csv">CSV</option>
            <option value="excel">Excel</option>
            <option value="pdf">PDF</option>
          </select>
        </div>

        <button onClick={savePrefs} className="px-4 py-2 bg-blue-600 text-white rounded-md">
          Save Preferences
        </button>
      </div>
    </div>
  );
}
