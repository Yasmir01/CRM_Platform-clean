import React, { useState } from 'react';
import { useSession } from '../auth/useSession';
import { PaymentsPage } from './PaymentsPage';
import { MaintenanceRequestForm } from './MaintenanceRequestForm';

export function TenantPortal() {
  const { authenticated, loading } = useSession();
  const [tab, setTab] = useState<'payments' | 'maintenance'>('payments');

  if (loading) return <div>Loading session…</div>;
  if (!authenticated) return <div>Please log in</div>;

  return (
    <div>
      <h2>Tenant Portal</h2>
      <nav>
        <button onClick={() => setTab('payments')}>Payments</button>
        <button onClick={() => setTab('maintenance')}>Maintenance</button>
      </nav>

      <div className="tenant-tab-content">
        {tab === 'payments' ? <PaymentsPage /> : <MaintenanceRequestForm />}
      </div>
    </div>
  );
}
