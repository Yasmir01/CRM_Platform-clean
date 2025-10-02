"use client";

import Link from "next/link";
import HandymanRoundedIcon from '@mui/icons-material/HandymanRounded';

type User = {
  email?: string;
  name?: string | null;
  role: "SU" | "SA" | "Subscriber" | string;
};

export default function Sidebar({ user }: { user: User }) {
  const role = (user?.role || "Subscriber").toString();

  return (
    <aside className="builder-sidebar" aria-label="CRM Sidebar">
      <div className="builder-sidebar-header">
        <div className="builder-logo" aria-hidden />
        <h2 className="builder-sidebar-title">CRM</h2>
      </div>

      <div className="builder-user-greeting p-3">
        <div className="builder-user-name">Hello, {user?.name ?? "User"}</div>
        <div className="builder-user-email text-sm text-muted">{user?.email}</div>
      </div>

      <nav className="builder-nav" aria-label="Primary navigation">
        <ul className="builder-nav-list">
          <li className="builder-nav-item"><Link href="/dashboard" className="builder-nav-link">Dashboard</Link></li>
          {(role === "SU" || role === "SA") && (
            <li className="builder-nav-item"><Link href="/companies" className="builder-nav-link">Companies</Link></li>
          )}
          <li className="builder-nav-item"><Link href="/contacts" className="builder-nav-link">Contacts</Link></li>
          <li className="builder-nav-item"><Link href="/service-providers" className="builder-nav-link"><HandymanRoundedIcon fontSize="small" className="inline-block mr-2" />Service Providers</Link></li>

          {role === "SU" && (
            <>
              <li className="builder-nav-item"><Link href="/admin/users" className="builder-nav-link">Manage Users</Link></li>
              <li className="builder-nav-item"><Link href="/admin/settings" className="builder-nav-link">System Settings</Link></li>
            </>
          )}

          {role === "SA" && (
            <li className="builder-nav-item"><Link href="/admin/reports" className="builder-nav-link">Reports</Link></li>
          )}

          {role.toUpperCase() === "SUBSCRIBER" && (
            <li className="builder-nav-item"><Link href="/my-deals" className="builder-nav-link">My Deals</Link></li>
          )}
        </ul>
      </nav>

      <div className="builder-sidebar-footer p-3">
        <div className="builder-footer-text">© {new Date().getFullYear()} CRM Dashboard</div>
      </div>
    </aside>
  );
}
