"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Role = "SUPER_ADMIN" | "ADMIN" | "USER";

interface SidebarProps {
  role?: Role; // Pass this from Builder.io (e.g. "SUPER_ADMIN")
}

const Sidebar: React.FC<SidebarProps> = ({ role = "USER" }) => {
  const pathname = usePathname() || "/";

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
    <aside className="builder-sidebar" aria-label="CRM Sidebar">
      <div className="builder-sidebar-header">
        <div className="builder-logo" aria-hidden />
        <h2 className="builder-sidebar-title">CRM Sidebar</h2>
      </div>

      <nav className="builder-nav" aria-label="Primary navigation">
        <ul className="builder-nav-list">
          {menu[role].map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <li key={item.href} className="builder-nav-item">
                <Link
                  href={item.href}
                  className={`builder-nav-link ${isActive ? "builder-nav-link-active" : ""}`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
