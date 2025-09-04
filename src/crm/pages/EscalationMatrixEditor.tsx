import React from 'react';

export default function EscalationMatrixEditor() {
  const [matrix, setMatrix] = React.useState<any[]>([]);
  const [level, setLevel] = React.useState('1');
  const [role, setRole] = React.useState('ADMIN');
  const [hours, setHours] = React.useState('0');
  const [scope, setScope] = React.useState<'global' | 'property' | 'plan'>('global');
  const [propertyId, setPropertyId] = React.useState('');
  const [planId, setPlanId] = React.useState('');
  const [properties, setProperties] = React.useState<any[]>([]);
  const [plans, setPlans] = React.useState<any[]>([]);
  const [saving, setSaving] = React.useState(false);

  const load = React.useCallback(async () => {
    const [mxRes, propsRes, plansRes] = await Promise.all([
      fetch('/api/sla/escalation-matrices', { credentials: 'include' }),
      fetch('/api/admin/filters/properties', { credentials: 'include' }),
      fetch('/api/subscription-plans', { credentials: 'include' }),
    ]);
    const [mx, props, pls] = await Promise.all([mxRes.json(), propsRes.json(), plansRes.json()]);
    setMatrix(Array.isArray(mx) ? mx : []);
    setProperties(Array.isArray(props) ? props : []);
    setPlans(Array.isArray(pls) ? pls : []);
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const save = async () => {
    const lvl = Number(level);
    const hrs = Number(hours);
    if (!lvl || Number.isNaN(hrs) || !role) return;
    const body: any = { level: lvl, role, hoursAfterDeadline: hrs };
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
        setLevel('1');
        setRole('ADMIN');
        setHours('0');
        setScope('global');
        setPropertyId('');
        setPlanId('');
        load();
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 bg-white shadow rounded space-y-4">
      <div>
        <h2 className="text-lg font-bold">Escalation Matrix</h2>
        <p className="text-sm text-gray-500">Customize SLA rules by property or plan.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-6 gap-2 items-end">
        <div className="flex flex-col">
          <label className="text-xs text-gray-600">Level</label>
          <input type="number" className="border p-2 rounded" value={level} onChange={(e) => setLevel(e.target.value)} />
        </div>
        <div className="flex flex-col">
          <label className="text-xs text-gray-600">Role</label>
          <select className="border p-2 rounded" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="ADMIN">Admin</option>
            <option value="MANAGER">Manager</option>
            <option value="SUPER_ADMIN">Super Admin</option>
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-xs text-gray-600">Hours After Deadline</label>
          <input type="number" className="border p-2 rounded" value={hours} onChange={(e) => setHours(e.target.value)} />
        </div>
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
            <select className="border p-2 rounded" value={propertyId} onChange={(e) => setPropertyId(e.target.value)}>
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
            <select className="border p-2 rounded" value={planId} onChange={(e) => setPlanId(e.target.value)}>
              <option value="">Select plan…</option>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        )}
        <div className="flex">
          <button onClick={save} disabled={saving} className="bg-blue-600 text-white px-3 py-2 rounded w-full md:w-auto">
            {saving ? 'Saving…' : 'Add/Update'}
          </button>
        </div>
      </div>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2">Level</th>
            <th className="p-2">Role</th>
            <th className="p-2">Hours After Deadline</th>
            <th className="p-2">Scope</th>
          </tr>
        </thead>
        <tbody>
          {matrix.map((row: any) => (
            <tr key={row.id} className="border-t">
              <td className="p-2">{row.level}</td>
              <td className="p-2">{row.role}</td>
              <td className="p-2">{row.hoursAfterDeadline}</td>
              <td className="p-2">
                {row.property ? `Property: ${row.property.address}` : row.subscriptionPlan ? `Plan: ${row.subscriptionPlan.name}` : 'Global'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
