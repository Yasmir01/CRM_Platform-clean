import React from "react";
import { Link } from "react-router-dom";

type Role = "admin" | "subscriber";

interface SidebarProps {
  role: Role;
  className?: string;
}

const RoleSidebar: React.FC<SidebarProps> = ({ role, className = "" }) => {
  return (
    <aside className={`sidebar-container w-64 bg-gray-900 text-white h-screen p-4 space-y-4 ${className}`} aria-label="CRM navigation">
      <h2 className="sidebar-title text-xl font-bold mb-6">CRM Menu</h2>

      <nav className="sidebar-nav space-y-2">
        <Link to="/dashboard" className="nav-link block px-3 py-2 rounded hover:bg-gray-700">
          Dashboard
        </Link>

        {role === "admin" ? (
          <>
            <Link to="/companies" className="nav-link block px-3 py-2 rounded hover:bg-gray-700">
              Companies
            </Link>
            <Link to="/contacts" className="nav-link block px-3 py-2 rounded hover:bg-gray-700">
              Contacts
            </Link>
            <Link to="/deals" className="nav-link block px-3 py-2 rounded hover:bg-gray-700">
              Deals
            </Link>
            <Link to="/service-providers" className="nav-link block px-3 py-2 rounded hover:bg-gray-700">
              Service Providers
            </Link>
            <Link to="/reports" className="nav-link block px-3 py-2 rounded hover:bg-gray-700">
              Reports
            </Link>
            <Link to="/users" className="nav-link block px-3 py-2 rounded hover:bg-gray-700">
              Users / Roles
            </Link>
            <Link to="/settings" className="nav-link block px-3 py-2 rounded hover:bg-gray-700">
              Settings
            </Link>
          </>
        ) : (
          <>
            <Link to="/my-company" className="nav-link block px-3 py-2 rounded hover:bg-gray-700">
              My Company
            </Link>
            <Link to="/contacts" className="nav-link block px-3 py-2 rounded hover:bg-gray-700">
              Contacts
            </Link>
            <Link to="/deals" className="nav-link block px-3 py-2 rounded hover:bg-gray-700">
              Deals
            </Link>
            <Link to="/service-providers" className="nav-link block px-3 py-2 rounded hover:bg-gray-700">
              Service Providers
            </Link>
          </>
        )}
      </nav>
    </aside>
  );
};

export default RoleSidebar;
