import React from "react";
import Link from "next/link";
import "./builder-sidebar-layout.css";

type Role = "SUPER_ADMIN" | "ADMIN" | "USER";

interface SidebarLayoutProps {
  role?: Role;
  children?: React.ReactNode;
}

export default function BuilderSidebarLayout({ role = "USER", children }: SidebarLayoutProps) {
  const menu: Record<Role, { label: string; href: string }[]> = {
    SUPER_ADMIN: [
      { label: "Dashboard", href: "/" },
      { label: "Users", href: "/users" },
      { label: "Companies", href: "/companies" },
      { label: "Contacts", href: "/contacts" },
      { label: "Deals", href: "/deals" },
      { label: "Service Providers", href: "/service-providers" },
      { label: "Reports", href: "/reports" },
      { label: "Settings", href: "/settings" },
    ],
    ADMIN: [
      { label: "Dashboard", href: "/" },
      { label: "Companies", href: "/companies" },
      { label: "Contacts", href: "/contacts" },
      { label: "Deals", href: "/deals" },
      { label: "Service Providers", href: "/service-providers" },
      { label: "Reports", href: "/reports" },
    ],
    USER: [
      { label: "Dashboard", href: "/" },
      { label: "Contacts", href: "/contacts" },
      { label: "Deals", href: "/deals" },
      { label: "Service Providers", href: "/service-providers" },
    ],
  };

  return (
    <div className="sb-layout">
      <aside className="sb-sidebar" aria-label="CRM Sidebar">
        <div className="sb-sidebar-header">
          <div className="sb-logo" aria-hidden />
          <h2 className="sb-title">CRM Sidebar</h2>
        </div>

        <nav className="sb-nav" aria-label="Primary navigation">
          <ul className="sb-nav-list">
            {menu[role].map((item) => (
              <li key={item.href} className="sb-nav-item">
                <Link href={item.href} className="sb-nav-link">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <main className="sb-main" id="sb-main-content">
        {children ? (
          children
        ) : (
          <div className="sb-placeholder">
            <h1 className="sb-main-title">Welcome to the CRM</h1>
            <p className="sb-main-sub">Drop your page content here.</p>
          </div>
        )}
      </main>
    </div>
  );
}
