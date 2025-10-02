import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { navConfig, Role } from './NavConfig';

export default function SidebarNav({ role }: { role: Role }) {
  const { pathname } = useLocation();
  const items = navConfig[role] || [];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">MyCRM</div>
      <nav className="sidebar-nav">
        {items.map((item) => (
          <Link key={item.href} to={item.href} className={`sidebar-link ${pathname.startsWith(item.href) ? 'active' : ''}`}>
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="sidebar-footer">
        <a href="/logout">Logout</a>
      </div>
    </aside>
  );
}
