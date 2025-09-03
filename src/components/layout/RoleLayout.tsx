import React from 'react';
import AppLayout from './AppLayout';
import { normalizeRole, Role } from './NavConfig';
import { useAuth } from '../../crm/contexts/AuthContext';

export default function RoleLayout({ children, fallback }: { children: React.ReactNode; fallback?: Role }) {
  const { user } = useAuth();
  const role = normalizeRole(user?.role) || (fallback || 'TENANT');
  return <AppLayout role={role}>{children}</AppLayout>;
}
