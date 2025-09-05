import { useQuery } from '@tanstack/react-query';
import { CircularProgress } from '@mui/material';

export default function RentRiskMeter({ tenantId }: { tenantId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['rent-risk', tenantId],
    queryFn: async () => {
      const r = await fetch(`/api/ai/risk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        cache: 'no-store',
        body: JSON.stringify({ tenantId }),
      });
      if (!r.ok) throw new Error('failed');
      return r.json();
    },
  });

  if (isLoading) return <CircularProgress />;
  if (!data) return <div>No risk data available</div>;

  return (
    <div className="p-4 rounded-xl shadow bg-white text-center">
      <h3 className="font-medium mb-2">Payment Risk</h3>
      <p
        className={
          data.score > 70
            ? 'text-green-600 text-2xl font-bold'
            : data.score > 40
            ? 'text-yellow-600 text-2xl font-bold'
            : 'text-red-600 text-2xl font-bold'
        }
      >
        {data.score}/100
      </p>
      <div className="text-xs text-gray-500">
        {data.score > 70 ? 'Low risk' : data.score > 40 ? 'Medium risk' : 'High risk'}
      </div>
    </div>
  );
}
