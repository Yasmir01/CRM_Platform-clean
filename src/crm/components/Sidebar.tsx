"use client";

import React from "react";
import Link from "next/link";
import { useSession } from "@/auth/useSession";

export default function Sidebar() {
  const sess = useSession() as any;
  const user = sess?.user || null;
  const role = (user && (user.role || (Array.isArray(user.roles) ? user.roles[0] : undefined))) || "SUBSCRIBER";

  const commonLinks = [
    { href: "/crm/dashboard", label: "Dashboard" },
    { href: "/crm/contacts", label: "Contacts" },
    { href: "/crm/companies", label: "Companies" },
    { href: "/crm/service-providers", label: "Service Providers" },
  ];

  const superAdminLinks = [
    { href: "/crm/deals", label: "Deals" },
    { href: "/crm/users", label: "User Management" },
    { href: "/crm/reports", label: "Reports" },
    { href: "/crm/settings", label: "System Settings" },
  ];

  const links = String(role).toUpperCase() === "SUPER_ADMIN" ? [...commonLinks, ...superAdminLinks] : commonLinks;

  return (
    <aside className="crm-sidebar w-64 bg-gray-800 text-white h-screen p-6">
      <h2 className="crm-sidebar-title text-xl font-bold mb-6">CRM Menu</h2>

      <nav className="crm-sidebar-nav" aria-label="CRM navigation">
        <ul className="crm-sidebar-list space-y-2">
          {links.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="crm-nav-link block px-3 py-2 rounded hover:bg-gray-700">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
