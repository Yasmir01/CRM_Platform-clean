import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MENU, type AppRole } from '@/config/menu';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';

export default function ResponsiveSidebar({ currentRole = 'SUPER_ADMIN' }: { currentRole?: AppRole }) {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = open ? 'hidden' : original || '';
    return () => {
      document.body.style.overflow = original || '';
    };
  }, [open]);

  const items = MENU.filter((i) => !i.roles || i.roles.includes(currentRole));

  return (
    <>
      {/* Top bar (mobile) */}
      <div className="md:hidden sticky top-0 z-50 flex items-center justify-between p-3 border-b bg-gray-900 text-white">
        <div className="flex items-center gap-2">
          <span className="font-semibold">Prop CRM</span>
        </div>
        <button aria-label="Open menu" onClick={() => setOpen(true)}>
          <MenuIcon className="h-6 w-6" />
        </button>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:left-0 md:w-64 bg-gray-900 text-gray-100">
        <div className="h-14 flex items-center px-4 border-b border-gray-800 text-lg font-semibold">Super Administrator</div>
        <nav className="flex-1 overflow-y-auto px-2 py-3">
          {items.map((it) => {
            const Icon = it.icon as any;
            const active = pathname === it.href || pathname.startsWith(it.href + '/');
            return (
              <Link
                key={it.href}
                to={it.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-gray-800 ${active ? 'bg-gray-800 font-medium' : ''}`}
              >
                {Icon ? <Icon fontSize="small" /> : null}
                <span>{it.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile drawer (overlay) */}
      <div
        className={`md:hidden fixed inset-0 z-50 transition-transform ${open ? 'translate-x-0' : '-translate-x-full'}`}
        aria-hidden={!open}
      >
        {/* backdrop */}
        <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
        {/* drawer */}
        <aside className="relative h-[100dvh] w-72 bg-gray-900 text-gray-100 shadow-xl">
          <div className="h-14 flex items-center justify-between px-4 border-b border-gray-800">
            <span className="font-semibold">Menu</span>
            <button aria-label="Close menu" onClick={() => setOpen(false)}>
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>
          <nav className="h-[calc(100dvh-3.5rem)] overflow-y-auto px-2 py-3">
            {items.map((it) => {
              const Icon = it.icon as any;
              const active = pathname === it.href || pathname.startsWith(it.href + '/');
              return (
                <Link
                  key={it.href}
                  to={it.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-gray-800 ${active ? 'bg-gray-800 font-medium' : ''}`}
                  onClick={() => setOpen(false)}
                >
                  {Icon ? <Icon fontSize="small" /> : null}
                  <span>{it.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>
      </div>
    </>
  );
}
