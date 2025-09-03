import React from 'react';
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

export function TenantSecurity() {
  const [qr, setQr] = React.useState<string | null>(null);
  const [code, setCode] = React.useState('');

  async function start() {
    const r = await fetch('/api/2fa/setup', { method: 'POST', credentials: 'include' });
    const d = await r.json(); setQr(d.qr || null);
  }
  async function verify() {
    await fetch('/api/2fa/verify', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: code }) });
    alert('2FA enabled');
  }
  async function disable2fa() {
    await fetch('/api/2fa/disable', { method: 'POST', credentials: 'include' });
    alert('2FA disabled'); setQr(null);
  }

  return (
    <RoleLayout>
      <h1>Security</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 360 }}>
        <button onClick={start}>Start 2FA Setup</button>
        {qr && <img src={qr} alt="2FA QR" style={{ border: '1px solid #ccc', borderRadius: 8, padding: 8 }} />}
        <div style={{ display: 'flex', gap: 8 }}>
          <input value={code} onChange={(e) => setCode((e.target as HTMLInputElement).value)} placeholder="123456" />
          <button onClick={verify}>Verify</button>
        </div>
        <button onClick={disable2fa}>Disable 2FA</button>
      </div>
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
