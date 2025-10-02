import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@mui/material';

export default function OwnerSummary({ ownerId }: { ownerId: string }) {
  const { data } = useQuery({
    queryKey: ['owner-summary', ownerId],
    queryFn: async () => {
      const r = await fetch(`/api/owner/summary?ownerId=${encodeURIComponent(ownerId)}`, {
        credentials: 'include',
        cache: 'no-store',
      });
      if (!r.ok) throw new Error('failed');
      return r.json();
    },
  });

  return (
    <Card className="rounded-2xl shadow p-4">
      <CardContent>
        <h2 className="text-xl font-semibold mb-2">Owner Statement</h2>
        <p>Total Rent Collected: <strong>${(data?.rentCollected ?? 0).toFixed(2)}</strong></p>
        <p>Total Expenses: <strong>${(data?.expenses ?? 0).toFixed(2)}</strong></p>
        <p>Net Income: <strong>${(((data?.rentCollected ?? 0) - (data?.expenses ?? 0)) as number).toFixed(2)}</strong></p>
      </CardContent>
    </Card>
  );
}
