import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function InsightsDashboard({ orgId }: { orgId: string }) {
  const { data: forecastData, isLoading: forecastLoading } = useQuery({
    queryKey: ['forecast', orgId],
    queryFn: async () => {
      const r = await fetch(`/api/ai/forecast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        cache: 'no-store',
        body: JSON.stringify({ orgId, months: 3 }),
      });
      if (!r.ok) throw new Error('failed');
      return r.json();
    },
  });

  const { data: riskData, isLoading: riskLoading } = useQuery({
    queryKey: ['top-risk', orgId],
    queryFn: async () => {
      const r = await fetch(`/api/ai/top-risk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        cache: 'no-store',
        body: JSON.stringify({ orgId }),
      });
      if (!r.ok) throw new Error('failed');
      return r.json();
    },
  });

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card className="rounded-2xl shadow p-4">
        <CardContent>
          <h2 className="text-xl font-semibold mb-4">Cashflow Forecast</h2>
          {forecastLoading ? (
            <div>Loading forecast…</div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={forecastData?.forecast ?? []}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="income" stroke="#16a34a" name="Income" />
                <Line type="monotone" dataKey="expenses" stroke="#dc2626" name="Expenses" />
                <Line type="monotone" dataKey="net" stroke="#2563eb" name="Net" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow p-4">
        <CardContent>
          <h2 className="text-xl font-semibold mb-4">Top At-Risk Tenants</h2>
          {riskLoading ? (
            <div>Loading risk data…</div>
          ) : (
            <ul className="space-y-2">
              {(riskData?.tenants ?? []).map((t: any) => (
                <li key={t.id} className="flex justify-between">
                  <span>{t.name}</span>
                  <span
                    className={
                      t.score > 70
                        ? 'text-green-600'
                        : t.score > 40
                        ? 'text-yellow-600'
                        : 'text-red-600'
                    }
                  >
                    {t.score}/100
                  </span>
                </li>)
              )}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
