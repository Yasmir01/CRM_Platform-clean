"use client";
import { useEffect, useState } from "react";

export default function AdminWebhooksPage() {
  const [list, setList] = useState<any[]>([]);
  const [form, setForm] = useState({ name: '', url: '', event: '', subscriberId: '' });

  async function fetchList() {
    const res = await fetch('/api/admin/webhooks');
    if (res.ok) setList(await res.json());
  }

  useEffect(() => { fetchList(); }, []);

  async function create(e: any) {
    e.preventDefault();
    const res = await fetch('/api/admin/webhooks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    if (res.ok) { setForm({ name: '', url: '', event: '', subscriberId: '' }); fetchList(); alert('Created'); } else { alert('Failed'); }
  }

  async function remove(id: string) {
    if (!confirm('Delete webhook?')) return;
    await fetch(`/api/admin/webhooks/${id}`, { method: 'DELETE' });
    fetchList();
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Outbound Webhooks</h1>
      <form onSubmit={create} className="mb-4 space-y-2">
        <input placeholder="Name" required value={form.name} onChange={e=>setForm({...form, name: e.target.value})} className="border p-2" />
        <input placeholder="URL" required value={form.url} onChange={e=>setForm({...form, url: e.target.value})} className="border p-2" />
        <input placeholder="Event (e.g. lead.created)" required value={form.event} onChange={e=>setForm({...form, event: e.target.value})} className="border p-2" />
        <input placeholder="SubscriberId (optional)" value={form.subscriberId} onChange={e=>setForm({...form, subscriberId: e.target.value})} className="border p-2" />
        <button className="px-3 py-2 bg-blue-600 text-white rounded">Create</button>
      </form>

      <div>
        <h2 className="font-semibold mb-2">Configured Webhooks</h2>
        <ul>
          {list.map(w => (
            <li key={w.id} className="border p-2 mb-2 flex justify-between items-center">
              <div>
                <div className="font-medium">{w.name} — {w.event}</div>
                <div className="text-sm text-gray-600">{w.url} {w.subscriberId ? ` (subscriber ${w.subscriberId})` : ''}</div>
              </div>
              <div>
                <button onClick={()=>remove(w.id)} className="px-2 py-1 bg-red-600 text-white rounded">Delete</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
