"use client";
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useUser } from "../src/hooks/useUser";

type UserRole = "SU" | "SA" | "Subscriber";

export default function Sidebar() {
  const pathname = usePathname() || "/";
  const [role, setRole] = useState<UserRole>("Subscriber");

  const { user, loading } = useUser();

  useEffect(() => {
    if (!loading) {
      if (user && (user.role === "SU" || user.role === "SA" || user.role === "Subscriber")) {
        setRole(user.role as UserRole);
      } else {
        try {
          const storedRole = localStorage.getItem("userRole") as UserRole | null;
          if (storedRole === "SU" || storedRole === "SA" || storedRole === "Subscriber") {
            setRole(storedRole);
          }
        } catch (e) {
          // ignore
        }
      }
    }
  }, [user, loading]);

  const navItems: { href: string; label: string; roles: UserRole[] }[] = [
    { href: "/contacts", label: "Contacts", roles: ["SU", "SA", "Subscriber"] },
    { href: "/companies", label: "Companies", roles: ["SU", "SA"] },
    { href: "/service-providers", label: "Service Providers", roles: ["SU", "SA", "Subscriber"] },
  ];

  return (
    <aside className="builder-sidebar" aria-label="CRM Sidebar">
      <div className="builder-sidebar-header">
        <div className="builder-logo" aria-hidden />
        <h2 className="builder-sidebar-title">CRM</h2>
      </div>

      <nav className="builder-nav" aria-label="Primary navigation">
        <ul className="builder-nav-list">
          {navItems
            .filter((item) => item.roles.includes(role))
            .map((item) => {
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

      <div className="builder-sidebar-footer">
        <div className="builder-footer-text">© {new Date().getFullYear()} CRM Dashboard</div>
      </div>
    </aside>
  );
}
