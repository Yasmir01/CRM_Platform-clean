"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSession } from "@/auth/useSession";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const sess = useSession() as any;
  const user = sess?.user || null;
  const role = (user && (user.role || (Array.isArray(user.roles) ? user.roles[0] : undefined))) || "SUBSCRIBER";
  const isSuper = String(role).toUpperCase() === "SUPER_ADMIN";

  const [isOpen, setIsOpen] = useState(false);

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

  const links = isSuper ? [...commonLinks, ...superAdminLinks] : commonLinks;

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar (desktop only) */}
      <aside className="hidden lg:flex lg:w-64 bg-gray-800 text-white flex-col">
        <div className="p-4 font-bold text-xl border-b border-gray-700">CRM Platform</div>
        <nav className="flex-1 p-4 space-y-2">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="block px-3 py-2 rounded hover:bg-gray-700">
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Mobile Topbar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 bg-gray-800 text-white z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-lg font-bold">CRM Platform</h1>
          <button className="p-2 rounded hover:bg-gray-700" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
            {isOpen ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        </div>

        {isOpen && (
          <nav className="bg-gray-900">
            <ul className="flex flex-col space-y-2 px-4 py-4">
              {links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="block px-3 py-2 rounded hover:bg-gray-700" onClick={() => setIsOpen(false)}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:ml-64 mt-12 lg:mt-0">{children}</main>
    </div>
  );
}
