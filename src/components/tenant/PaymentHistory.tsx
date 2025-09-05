import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@mui/material';

export default function PaymentHistory({ tenantId }: { tenantId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['payments', tenantId],
    queryFn: async () => {
      const r = await fetch(`/api/tenant/payments?tenantId=${encodeURIComponent(tenantId)}`, {
        credentials: 'include',
        cache: 'no-store',
      });
      if (!r.ok) throw new Error('failed');
      return r.json();
    },
  });

  if (isLoading) return <div>Loading payments…</div>;

  return (
    <div className="space-y-3">
      {(data ?? []).map((p: any) => (
        <Card key={p.id} className="rounded-xl shadow">
          <CardContent>
            <div className="flex justify-between">
              <span className="font-medium">${Number(p.amount || 0).toFixed(2)}</span>
              <span className={String(p.status).toLowerCase() === 'success' ? 'text-green-600' : 'text-yellow-600'}>
                {p.status}
              </span>
            </div>
            <div className="text-sm text-gray-500">{new Date(p.createdAt).toLocaleDateString()}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
