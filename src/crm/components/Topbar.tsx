"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSession } from "@/auth/useSession";

function MenuIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CloseIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Topbar() {
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
    <header className="crm-topbar bg-gray-800 text-white w-full">
      <div className="crm-topbar-inner flex items-center justify-between px-4 py-3">
        <div className="crm-brand flex items-center gap-3">
          <button
            onClick={() => setIsOpen((s) => !s)}
            className="crm-hamburger lg:hidden p-2 rounded hover:bg-gray-700"
            aria-label={isOpen ? "Close menu" : "Open menu"}
          >
            {isOpen ? <CloseIcon size={20} /> : <MenuIcon size={20} />}
          </button>

          <Link href="/crm/dashboard" className="crm-title text-lg font-bold">
            CRM Platform
          </Link>
        </div>

        <nav className="crm-desktop-nav hidden lg:block">
          <ul className="flex items-center gap-6 px-6 py-3">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="crm-toplink hover:underline">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <nav className="crm-mobile-nav lg:hidden bg-gray-900">
          <ul className="flex flex-col space-y-2 px-4 py-4">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="block px-3 py-2 rounded hover:bg-gray-700"
                  onClick={() => setIsOpen(false)}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
