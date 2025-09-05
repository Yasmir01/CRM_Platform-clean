import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MENU } from '../../config/menu';

function MenuIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="18" x2="20" y2="18" />
    </svg>
  );
}

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <>
      <div className="md:hidden flex items-center justify-between p-3 border-b bg-white">
        <h1 className="font-semibold text-lg">CRM</h1>
        <button onClick={() => setOpen((v) => !v)} aria-label="Toggle menu">
          <MenuIcon className="h-6 w-6" />
        </button>
      </div>

      <aside
        className={`fixed md:static top-0 left-0 h-full w-64 bg-white shadow-md transform transition-transform duration-300 z-40 ${
          open ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        <div className="p-4 font-bold text-xl border-b">CRM Menu</div>
        <nav className="p-4 space-y-1">
          {MENU.map((item) => {
            const Icon = item.icon as any;
            const active = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-gray-100 ${active ? 'bg-gray-100 font-medium' : ''}`}
                onClick={() => setOpen(false)}
              >
                {Icon ? <Icon fontSize="small" /> : null}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {open && <div className="fixed inset-0 bg-black/40 z-30 md:hidden" onClick={() => setOpen(false)} />}
    </>
  );
}
