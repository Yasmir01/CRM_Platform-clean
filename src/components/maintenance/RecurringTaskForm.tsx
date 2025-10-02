import React, { useState } from 'react';

export default function RecurringTaskForm({ propertyId, unitId }: { propertyId: string; unitId?: string }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    frequency: 'MONTH',
    interval: 1,
    firstRunAt: new Date().toISOString().slice(0, 16),
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch('/api/maintenance/recurring/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ ...form, propertyId, unitId }),
    });
    alert('Recurring task saved');
  }

  return (
    <form onSubmit={onSubmit} className="recurring-task-form">
      <input className="rt-input" placeholder="Title" value={form.title}
        onChange={e => setForm(v => ({ ...v, title: e.target.value }))} />
      <textarea className="rt-textarea" placeholder="Description" value={form.description}
        onChange={e => setForm(v => ({ ...v, description: e.target.value }))} />
      <div className="rt-row">
        <select className="rt-select" value={form.frequency}
          onChange={e => setForm(v => ({ ...v, frequency: e.target.value }))}>
          <option>DAY</option><option>WEEK</option><option>MONTH</option><option>QUARTER</option><option>YEAR</option>
        </select>
        <input type="number" min={1} className="rt-number" value={form.interval}
          onChange={e => setForm(v => ({ ...v, interval: Number(e.target.value) }))} />
        <input type="datetime-local" className="rt-datetime" value={form.firstRunAt}
          onChange={e => setForm(v => ({ ...v, firstRunAt: e.target.value }))} />
      </div>
      <button className="rt-button">Save</button>
    </form>
  );
}
