import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./builder-sidebar.css";

type UserRole = "SUPER_ADMIN" | "ADMIN" | "USER";

interface SidebarProps {
  role: UserRole;
  initialOpen?: boolean;
}

export default function BuilderSidebar({ role, initialOpen = true }: SidebarProps) {
  const [open, setOpen] = useState(Boolean(initialOpen));

  const menu = [
    { label: "Dashboard", href: "/crm" },
    { label: "Contacts", href: "/crm/contacts" },
    { label: "Companies", href: "/crm/companies" },
    { label: "Service Providers", href: "/crm/service-providers" },
  ];

  const visibleMenu =
    role === "SUPER_ADMIN"
      ? menu
      : role === "ADMIN"
      ? menu.filter((item) => item.label !== "Service Providers")
      : menu.filter((item) => ["Dashboard", "Contacts"].includes(item.label));

  return (
    <div className="builder-layout">
      <aside className={`builder-sidebar ${open ? "open" : "closed"}`} aria-label="CRM sidebar">
        <div className="builder-sidebar-header">
          <div className="builder-logo" aria-hidden />
          <h2 className="builder-sidebar-title">CRM Platform</h2>
        </div>

        <nav className="builder-nav" aria-label="Primary navigation">
          <ul className="builder-nav-list">
            {visibleMenu.map((item) => (
              <li key={item.href} className="builder-nav-item">
                <Link to={item.href} className="builder-nav-link" onClick={() => setOpen(false)}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <button
        className="builder-toggle md-hidden"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((s) => !s)}
      >
        ☰
      </button>

      <main className="builder-main">
        <h1 className="builder-main-title">Welcome!</h1>
        <p className="builder-main-help">Your content will load here.</p>
      </main>
    </div>
  );
}
