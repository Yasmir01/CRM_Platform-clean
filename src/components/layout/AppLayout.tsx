import ResponsiveSidebar from './ResponsiveSidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <ResponsiveSidebar />
      {/* left padding only on desktop where the sidebar is fixed */}
      <main className="md:pl-64">{children}</main>
    </div>
  );
}
