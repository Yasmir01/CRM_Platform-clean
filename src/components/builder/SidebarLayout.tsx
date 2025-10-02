import React from 'react';
import { Link } from 'react-router-dom';

interface SidebarLayoutProps {
  role?: 'SUPER_ADMIN' | 'ADMIN' | 'USER';
  children?: React.ReactNode;
}

import './SidebarLayout.css';

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

  const handleLogout = () => {
    try {
      // Clear demo/current user token and reload to reflect logout in editor preview
      localStorage.removeItem('currentUser');
      // Optionally clear access tokens used by demo contexts
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    } catch (e) {
      // ignore
    }
    if (typeof window !== 'undefined') window.location.reload();
  };

  const [menuOpen, setMenuOpen] = React.useState(false);

  return (
    <div className="sb-layout">
      <aside className="sb-sidebar" aria-label="CRM Sidebar">
        <div className="sb-sidebar-header">
          <div className="sb-logo" aria-hidden />
          <h2 className="sb-title">CRM</h2>
        </div>

        <nav className="sb-nav" aria-label="Primary navigation">
          <ul className="sb-nav-list">
            {items.map((item) => (
              <li key={item.href} className="sb-nav-item">
                <a href={item.href} className="sb-nav-link">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <div className="sb-main-column">
        <header className="sb-topbar">
          <div className="sb-topbar-left">
            <h1 className="sb-welcome">Welcome</h1>
          </div>
          <div className="sb-topbar-right">
            <div className="sb-profile" onClick={() => setMenuOpen((s) => !s)} aria-haspopup="true" aria-expanded={menuOpen}>
              <div className="sb-avatar">U</div>
              <div className="sb-username">User</div>
            </div>
            <button className="sb-logout" onClick={handleLogout}>Logout</button>
          </div>
        </header>

        <main className="sb-main" id="sb-main-content">
          {children}
        </main>
      </div>
    </div>
  );
}
