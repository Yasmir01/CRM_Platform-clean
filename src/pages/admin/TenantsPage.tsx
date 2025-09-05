import ResponsiveTable from '@/components/ui/ResponsiveTable';

const columns = [
  { key: 'name', label: 'Tenant' },
  { key: 'unit', label: 'Unit' },
  { key: 'status', label: 'Status' },
  { key: 'balance', label: 'Balance' },
] as const;

export default function TenantsPage() {
  const tenants = [
    { id: '1', name: 'John Doe', unit: 'A101', status: 'Active', balance: '$200' },
    { id: '2', name: 'Jane Smith', unit: 'B202', status: 'Late', balance: '$500' },
  ];

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Tenants</h1>
      <ResponsiveTable data={tenants} columns={columns as any} />
    </div>
  );
}
