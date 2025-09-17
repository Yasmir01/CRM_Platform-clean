import React from "react";
import Link from "next/link";

type Role = "SUPER_ADMIN" | "ADMIN" | "USER";

interface SidebarProps {
  role?: Role; // Pass this from Builder.io (e.g. "SUPER_ADMIN")
}

const Sidebar: React.FC<SidebarProps> = ({ role = "USER" }) => {
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
    <aside className="w-64 bg-gray-800 text-white min-h-screen p-4">
      <h2 className="text-xl font-bold mb-6">CRM Sidebar</h2>
      <nav>
        <ul className="space-y-2">
          {menu[role].map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="block px-3 py-2 rounded hover:bg-gray-700 transition">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
