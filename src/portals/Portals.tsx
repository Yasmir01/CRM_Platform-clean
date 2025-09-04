import RoleLayout from '../components/layout/RoleLayout';
import { PaymentsPage } from '../components/PaymentsPage';
import { MaintenanceRequestForm } from '../components/MaintenanceRequestForm';

export function TenantDashboard() {
  return (
    <RoleLayout>
      <h1>Tenant Dashboard</h1>
      <p>Welcome to your tenant portal.</p>
    </RoleLayout>
  );
}

export function TenantPayments() {
  return (
    <RoleLayout>
      <h1>Payments</h1>
      <PaymentsPage />
    </RoleLayout>
  );
}

export function TenantMaintenance() {
  return (
    <RoleLayout>
      <h1>Maintenance</h1>
      <MaintenanceRequestForm />
    </RoleLayout>
  );
}

export function TenantLease() {
  return (
    <RoleLayout>
      <h1>Lease</h1>
      <p>View and sign your lease.</p>
    </RoleLayout>
  );
}

export function OwnerDashboard() {
  return (
    <RoleLayout>
      <h1>Owner Dashboard</h1>
      <p>View your properties and monthly statements here.</p>
    </RoleLayout>
  );
}

export function OwnerStatements() {
  return (
    <RoleLayout>
      <h1>Statements</h1>
      <p>Monthly statements TBD.</p>
    </RoleLayout>
  );
}

export function OwnerProperties() {
  return (
    <RoleLayout>
      <h1>Properties</h1>
      <p>Manage owner properties.</p>
    </RoleLayout>
  );
}

export function VendorDashboard() {
  return (
    <RoleLayout>
      <h1>Vendor Dashboard</h1>
      <p>Assigned work orders and profile.</p>
    </RoleLayout>
  );
}

export function VendorWorkOrders() {
  return (
    <RoleLayout>
      <h1>Work Orders</h1>
      <p>Work orders list.</p>
    </RoleLayout>
  );
}

export function VendorProfile() {
  return (
    <RoleLayout>
      <h1>Profile</h1>
      <p>Update profile.</p>
    </RoleLayout>
  );
}

export function ManagerDashboard() {
  return (
    <RoleLayout>
      <h1>Manager Dashboard</h1>
      <p>Manage tenants, owners, and maintenance.</p>
    </RoleLayout>
  );
}

export function ManagerTenants() {
  return (
    <RoleLayout>
      <h1>Tenants</h1>
      <p>Manage tenants.</p>
    </RoleLayout>
  );
}

export function ManagerOwners() {
  return (
    <RoleLayout>
      <h1>Owners</h1>
      <p>Manage owners.</p>
    </RoleLayout>
  );
}

export function ManagerMaintenance() {
  return (
    <RoleLayout>
      <h1>Maintenance</h1>
      <p>Oversee maintenance.</p>
    </RoleLayout>
  );
}

export function AdminDashboard() {
  return (
    <RoleLayout>
      <h1>Admin Dashboard</h1>
      <p>System administration.</p>
    </RoleLayout>
  );
}

import PermissionEditor from '../components/admin/PermissionEditor';
import UserPermissionsGrid from '../components/admin/UserPermissionsGrid';
import ExportSchedule from '../components/admin/ExportSchedule';
import ImpersonationToggle from '../components/admin/ImpersonationToggle';

export function AdminUsers() {
  const params = new URLSearchParams(window.location.search);
  const userId = params.get('id') || '';
  return (
    <RoleLayout>
      <h1>Users</h1>
      {userId ? (
        <PermissionEditor userId={userId} />
      ) : (
        <>
          <UserPermissionsGrid />
          <ExportSchedule />
          <ImpersonationToggle />
        </>
      )}
    </RoleLayout>
  );
}

export function AdminLogs() {
  return (
    <RoleLayout>
      <h1>System Logs</h1>
      <p>View logs.</p>
    </RoleLayout>
  );
}

// --- Tenant AutoPay Settings ---
import * as React from 'react';
export function TenantAutopay() {
  const [autopay, setAutopay] = React.useState<any>(null);
  const [amount, setAmount] = React.useState('');
  const [day, setDay] = React.useState(1);

  React.useEffect(() => {
    fetch('/api/payments/autopay', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setAutopay(d))
      .catch(() => setAutopay(null));
  }, []);

  const save = async () => {
    const res = await fetch('/api/payments/autopay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ amount: parseFloat(amount), dayOfMonth: day, frequency: 'monthly' }),
    });
    if (res.ok) setAutopay(await res.json());
  };

  const cancel = async () => {
    await fetch('/api/payments/autopay', { method: 'DELETE', credentials: 'include' });
    setAutopay(null);
  };

  return (
    <RoleLayout>
      <h1>AutoPay Settings</h1>
      {autopay ? (
        <div className="space-y-2">
          <p>
            AutoPay: <strong>${autopay.amount}</strong> on day {autopay.dayOfMonth} each month
          </p>
          <button onClick={cancel} className="w-full bg-red-600 text-white p-2 rounded">
            Cancel AutoPay
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Rent amount"
            className="border p-2 rounded w-full"
          />
          <input
            type="number"
            value={day}
            onChange={(e) => setDay(parseInt(e.target.value))}
            min={1}
            max={28}
            className="border p-2 rounded w-full"
          />
          <button onClick={save} className="w-full bg-blue-600 text-white p-2 rounded">
            Enable AutoPay
          </button>
        </div>
      )}
    </RoleLayout>
  );
}
