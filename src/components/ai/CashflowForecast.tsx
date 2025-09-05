import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function CashflowForecast({ orgId }: { orgId: string }) {
  const { data, isLoading } = useQuery({
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

  if (isLoading) return <div>Loading forecast…</div>;
  if (!data) return <div>No forecast data available</div>;

  return (
    <Card className="rounded-2xl shadow p-4">
      <CardContent>
        <h2 className="text-xl font-semibold mb-4">Cashflow Forecast</h2>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data.forecast}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="income" stroke="#16a34a" name="Income" />
            <Line type="monotone" dataKey="expenses" stroke="#dc2626" name="Expenses" />
            <Line type="monotone" dataKey="net" stroke="#2563eb" name="Net" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
