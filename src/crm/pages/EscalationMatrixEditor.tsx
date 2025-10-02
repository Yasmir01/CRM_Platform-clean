import React from 'react';

type Row = {
  id: string;
  level: number;
  role: string;
  hoursAfterDeadline: number;
  propertyId?: string | null;
  subscriptionPlanId?: string | null;
  property?: { id: string; address: string } | null;
  subscriptionPlan?: { id: string; name: string } | null;
};

const ROLES = ['ADMIN', 'MANAGER', 'SUPER_ADMIN'];

export default function EscalationMatrixEditor() {
  const [rows, setRows] = React.useState<Row[]>([]);
  const [level, setLevel] = React.useState(1);
  const [role, setRole] = React.useState('ADMIN');
  const [hours, setHours] = React.useState(0);
  const [scope, setScope] = React.useState<'global' | 'property' | 'plan'>('global');
  const [propertyId, setPropertyId] = React.useState('');
  const [planId, setPlanId] = React.useState('');
  const [properties, setProperties] = React.useState<any[]>([]);
  const [plans, setPlans] = React.useState<any[]>([]);
  const [saving, setSaving] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const fetchScopeRows = React.useCallback(async () => {
    setLoading(true);
    const p = new URLSearchParams();
    p.set('scope', scope);
    if (scope === 'property' && propertyId) p.set('propertyId', propertyId);
    if (scope === 'plan' && planId) p.set('planId', planId);

<<<<<<< HEAD
    try {
      const res = await fetch(`/api/sla/escalation-matrices?${p.toString()}`, { credentials: 'include' });
      if (!res.ok) {
        console.warn('escalation-matrices request failed', res.status);
        setRows([]);
        return;
      }
      try {
        const data = await res.json();
        setRows(Array.isArray(data) ? data : []);
      } catch (e) {
        console.warn('Failed to parse escalation-matrices response', e);
        setRows([]);
      }
    } catch (e) {
      console.error('fetchScopeRows error', e);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [scope, propertyId, planId]);

  const load = React.useCallback(async () => {
    try {
      const [propsRes, plansRes] = await Promise.all([
        fetch('/api/admin/filters/properties', { credentials: 'include' }),
        fetch('/api/subscription-plans', { credentials: 'include' }),
      ]);

      let props: any = [];
      let pls: any = [];

      if (propsRes.ok) {
        try { props = await propsRes.json(); } catch (e) { console.warn('Failed to parse properties response', e); props = []; }
      }

      if (plansRes.ok) {
        try { pls = await plansRes.json(); } catch (e) { console.warn('Failed to parse plans response', e); pls = []; }
      }

      setProperties(Array.isArray(props) ? props : []);
      setPlans(Array.isArray(pls) ? pls : []);

      // fetch current scope rows after loading filters
      try { await fetchScopeRows(); } catch (e) { console.warn('fetchScopeRows failed', e); }
    } catch (e) {
      console.error('Failed to load escalation matrix data', e);
      setProperties([]);
      setPlans([]);
    }
=======
    const res = await fetch(`/api/sla/escalation-matrices?${p.toString()}`, { credentials: 'include' });
    const data = await res.json();
    setRows(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [scope, propertyId, planId]);

  const load = React.useCallback(async () => {
    const [propsRes, plansRes] = await Promise.all([
      fetch('/api/admin/filters/properties', { credentials: 'include' }),
      fetch('/api/subscription-plans', { credentials: 'include' }),
    ]);
    const [props, pls] = await Promise.all([propsRes.json(), plansRes.json()]);
    setProperties(Array.isArray(props) ? props : []);
    setPlans(Array.isArray(pls) ? pls : []);
    fetchScopeRows();
>>>>>>> ac4b396533b24013bc1866988c2033005cd609c9
  }, [fetchScopeRows]);

  React.useEffect(() => { load(); }, [load]);
  React.useEffect(() => { fetchScopeRows(); }, [fetchScopeRows]);

  const resetForm = () => {
    setLevel(1);
    setRole('ADMIN');
    setHours(0);
  };

  const save = async () => {
    if (!level || hours < 0 || !role) return;
    const body: any = { level, role, hoursAfterDeadline: hours };
    if (scope === 'property') body.propertyId = propertyId || null;
    if (scope === 'plan') body.subscriptionPlanId = planId || null;
    if (scope === 'property' && !body.propertyId) return;
    if (scope === 'plan' && !body.subscriptionPlanId) return;

    setSaving(true);
    try {
      const r = await fetch('/api/sla/escalation-matrix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });
      if (r.ok) {
        resetForm();
        fetchScopeRows();
      }
    } finally {
      setSaving(false);
    }
  };

  const updateRow = async (id: string, patch: Partial<Row>) => {
    const r = await fetch(`/api/sla/escalation-matrix/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(patch),
    });
    if (r.ok) fetchScopeRows();
  };

  const deleteRow = async (id: string) => {
    if (!confirm('Delete this escalation level?')) return;
    const r = await fetch(`/api/sla/escalation-matrix/${id}`, { method: 'DELETE', credentials: 'include' });
    if (r.ok) fetchScopeRows();
  };

  return (
    <div className="p-4 bg-white shadow rounded space-y-4">
      <div>
        <h2 className="text-lg font-bold">Escalation Matrix</h2>
        <p className="text-sm text-gray-500">Customize SLA rules by property or plan.</p>
      </div>

      <div className="flex flex-wrap items-end gap-2">
        <div className="flex flex-col">
          <label className="text-xs text-gray-600">Scope</label>
          <select className="border p-2 rounded" value={scope} onChange={(e) => setScope(e.target.value as any)}>
            <option value="global">Global</option>
            <option value="plan">Plan</option>
            <option value="property">Property</option>
          </select>
        </div>
        {scope === 'property' && (
          <div className="flex flex-col">
            <label className="text-xs text-gray-600">Property</label>
            <select className="border p-2 rounded min-w-[220px]" value={propertyId} onChange={(e) => setPropertyId(e.target.value)}>
              <option value="">Select property…</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        )}
        {scope === 'plan' && (
          <div className="flex flex-col">
            <label className="text-xs text-gray-600">Subscription Plan</label>
            <select className="border p-2 rounded min-w-[220px]" value={planId} onChange={(e) => setPlanId(e.target.value)}>
              <option value="">Select plan…</option>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-6 gap-2 items-end">
        <div className="flex flex-col">
          <label className="text-xs text-gray-600">Level</label>
          <input type="number" min={1} className="border p-2 rounded" value={level} onChange={(e) => setLevel(parseInt(e.target.value || '1'))} />
        </div>
        <div className="flex flex-col">
          <label className="text-xs text-gray-600">Role</label>
          <select className="border p-2 rounded" value={role} onChange={(e) => setRole(e.target.value)}>
            {ROLES.map(r => <option key={r} value={r}>{r.replace('_',' ')}</option>)}
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-xs text-gray-600">Hours After Deadline</label>
          <input type="number" min={0} className="border p-2 rounded" value={hours} onChange={(e) => setHours(parseInt(e.target.value || '0'))} />
        </div>
        <div className="flex">
          <button onClick={save} disabled={saving} className="bg-blue-600 text-white px-3 py-2 rounded w-full md:w-auto">
            {saving ? 'Saving…' : 'Add / Upsert'}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Current Matrix</h3>
        {loading && <span className="text-xs text-gray-500">Loading…</span>}
      </div>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2">Level</th>
            <th className="p-2">Role</th>
            <th className="p-2">Hours After Deadline</th>
            <th className="p-2">Scope</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <EditableRow key={row.id} row={row} onSave={updateRow} onDelete={deleteRow} />
          ))}
          {rows.length === 0 && (
            <tr>
              <td className="p-3 text-center text-sm text-gray-500" colSpan={5}>No rows for this scope.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function EditableRow({ row, onSave, onDelete }: { row: Row; onSave: (id: string, patch: Partial<Row>) => void; onDelete: (id: string) => void; }) {
  const [lvl, setLvl] = React.useState<number>(row.level);
  const [role, setRole] = React.useState<string>(row.role);
  const [hrs, setHrs] = React.useState<number>(row.hoursAfterDeadline);
  const dirty = lvl !== row.level || role !== row.role || hrs !== row.hoursAfterDeadline;

  return (
    <tr className="border-t hover:bg-gray-50">
      <td className="p-2"><input type="number" min={1} className="border p-1 rounded w-20" value={lvl} onChange={(e) => setLvl(parseInt(e.target.value || '1'))} /></td>
      <td className="p-2">
        <select className="border p-1 rounded" value={role} onChange={(e) => setRole(e.target.value)}>
          {ROLES.map(r => <option key={r} value={r}>{r.replace('_',' ')}</option>)}
        </select>
      </td>
      <td className="p-2"><input type="number" min={0} className="border p-1 rounded w-24" value={hrs} onChange={(e) => setHrs(parseInt(e.target.value || '0'))} /></td>
      <td className="p-2">{row.property ? `Property: ${row.property.address}` : row.subscriptionPlan ? `Plan: ${row.subscriptionPlan.name}` : 'Global'}</td>
      <td className="p-2">
        <div className="flex gap-2">
          <button disabled={!dirty} onClick={() => onSave(row.id, { level: lvl, role, hoursAfterDeadline: hrs })} className={`px-3 py-1 rounded text-white ${dirty ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'}`}>Save</button>
          <button onClick={() => onDelete(row.id)} className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700">Delete</button>
        </div>
      </td>
    </tr>
  );
}
