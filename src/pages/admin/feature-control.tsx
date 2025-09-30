import React, { useEffect, useState } from 'react';

export default function FeatureControlPanel() {
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        const res = await fetch('/api/admin/subscribers');
        if (!res.ok) throw new Error('Failed to load subscribers');
        const data = await res.json();
        if (!mounted) return;
        setSubscribers(data || []);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || 'Failed');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  const toggleFeature = async (id: string, feature: string, value: boolean) => {
    try {
      const res = await fetch(`/api/admin/subscribers/${id}/features`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feature, value }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || 'Failed to update');
      }
      // optimistic update locally
      setSubscribers((prev) => prev.map((s) => s.id === id ? { ...s, [`forceAllow${feature[0].toUpperCase() + feature.slice(1)}`]: value } : s));
    } catch (e: any) {
      alert(e?.message || 'Update failed');
    }
  };

  if (loading) return <div className="p-6">Loading subscribers...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Super Admin Feature Control</h1>

      <div className="space-y-6">
        {subscribers.map((sub) => (
          <div key={sub.id} className="border rounded p-4 shadow bg-white">
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-bold text-lg">{sub.companyName || sub.name || sub.email || sub.id}</h2>
              <span className="text-sm text-gray-600">Plan: {sub.plan?.name || 'No Plan'}</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['exports', 'reminders', 'landingPages', 'branding'].map((feature) => {
                const cap = feature[0].toUpperCase() + feature.slice(1);
                const forceFlag = sub[`forceAllow${cap}`];
                const planAllows = sub.plan?.[`allow${cap}`];

                return (
                  <div key={feature} className="border rounded p-2">
                    <p className="font-medium capitalize">{feature}</p>
                    <p className="text-sm text-gray-500">Plan: {planAllows ? '✔ Allowed' : '✘ Blocked'}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => toggleFeature(sub.id, feature, !forceFlag)}
                        className={`px-3 py-1 rounded text-white ${forceFlag ? 'bg-red-500' : 'bg-green-500'}`}>
                        {forceFlag ? 'Disable Override' : 'Force Enable'}
                      </button>
                      {feature === 'exports' && (
                        <button
                          onClick={async () => {
                            try {
                              const res = await fetch(`/api/admin/subscribers/${sub.id}/impersonate`, { method: 'POST' });
                              const data = await res.json();
                              if (!res.ok) return alert(data?.error || 'Failed to impersonate');
                              const token = data.token;
                              // store as cookie for middleware to pick up
                              document.cookie = `impersonationToken=${token}; path=/`;
                              window.location.href = '/dashboard';
                            } catch (e) {
                              // eslint-disable-next-line no-console
                              console.error('impersonate error', e);
                              alert('Impersonation failed');
                            }
                          }}
                          className="px-3 py-1 rounded bg-blue-500 text-white"
                        >
                          Impersonate
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Per-subscriber impersonation alerts control */}
              <div className="border rounded p-2">
                <p className="font-medium">Impersonation Alerts</p>
                <p className="text-sm text-gray-500">{sub.impersonationAlerts === null || typeof sub.impersonationAlerts === 'undefined' ? 'Following Global' : sub.impersonationAlerts ? 'Enabled' : 'Disabled'}</p>
                <button
                  onClick={async () => {
                    try {
                      const current = sub.impersonationAlerts;
                      // toggle: if null -> true, if true->false, if false->null (cycle)
                      const newVal = (current === null || typeof current === 'undefined') ? true : (current === true ? false : null);
                      await fetch(`/api/admin/subscribers/${sub.id}/alerts`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ enabled: newVal }) });
                      window.location.reload();
                    } catch (e) {
                      console.error(e);
                      alert('Failed to update alerts setting');
                    }
                  }}
                  className="mt-2 px-3 py-1 rounded bg-indigo-600 text-white"
                >
                  Toggle Alert
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
