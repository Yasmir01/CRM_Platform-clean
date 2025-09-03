import React from 'react';
import SidebarNav from './SidebarNav';
import type { Role } from './NavConfig';

export default function AppLayout({ children, role }: { children: React.ReactNode; role: Role }) {
  return (
    <div className="app-shell">
      <SidebarNav role={role} />
      <main className="main-content">{children}</main>
    </div>
  );
}
