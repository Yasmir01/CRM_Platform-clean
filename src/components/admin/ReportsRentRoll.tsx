import { useQuery } from '@tanstack/react-query';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

export default function ReportsRentRoll({ orgId }: { orgId: string }) {
  const { data } = useQuery({
    queryKey: ['rent-roll', orgId],
    queryFn: async () => {
      const r = await fetch(`/api/reports/rent-roll?orgId=${encodeURIComponent(orgId)}`, {
        credentials: 'include',
        cache: 'no-store',
      });
      if (!r.ok) throw new Error('failed');
      return r.json();
    },
  });

  const columns: GridColDef[] = [
    { field: 'unit', headerName: 'Unit', flex: 1 },
    { field: 'tenant', headerName: 'Tenant', flex: 1 },
    { field: 'rent', headerName: 'Rent', flex: 1 },
    { field: 'status', headerName: 'Status', flex: 1 },
  ];

  return (
    <div style={{ height: 600 }}>
      <DataGrid rows={data?.rows ?? []} columns={columns} density="compact" disableRowSelectionOnClick />
    </div>
  );
}
