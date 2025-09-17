import React from 'react';
import { Link } from 'react-router-dom';

interface SidebarLayoutProps {
  role?: 'SUPER_ADMIN' | 'ADMIN' | 'USER';
  children?: React.ReactNode;
}

export default function SidebarLayout({ role = 'USER', children }: SidebarLayoutProps) {
  const menu: Record<string, { label: string; href: string }[]> = {
    SUPER_ADMIN: [
      { label: 'Dashboard', href: '/' },
      { label: 'Users', href: '/users' },
      { label: 'Companies', href: '/companies' },
      { label: 'Contacts', href: '/contacts' },
      { label: 'Deals', href: '/deals' },
      { label: 'Service Providers', href: '/service-providers' },
      { label: 'Reports', href: '/reports' },
      { label: 'Settings', href: '/settings' },
    ],
    ADMIN: [
      { label: 'Dashboard', href: '/' },
      { label: 'Companies', href: '/companies' },
      { label: 'Contacts', href: '/contacts' },
      { label: 'Deals', href: '/deals' },
      { label: 'Service Providers', href: '/service-providers' },
      { label: 'Reports', href: '/reports' },
    ],
    USER: [
      { label: 'Dashboard', href: '/' },
      { label: 'Contacts', href: '/contacts' },
      { label: 'Deals', href: '/deals' },
      { label: 'Service Providers', href: '/service-providers' },
    ],
  };

  const items = menu[role] || menu.USER;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{ width: 256, background: '#111827', color: '#fff', padding: 16, boxSizing: 'border-box' }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, marginBottom: 16 }}>CRM</h2>
        <nav>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {items.map((item) => (
              <li key={item.href}>
                {/* use plain anchor for Builder editor compatibility */}
                <a href={item.href} style={{ color: '#d1d5db', textDecoration: 'none', display: 'block', padding: '8px 12px', borderRadius: 6 }}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <main style={{ flex: 1, padding: 20, background: '#f9fafb' }}>
        {children}
      </main>
    </div>
  );
}
