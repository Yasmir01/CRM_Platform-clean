import { useEffect, useState } from 'react';

type AdminUser = { id: string; email: string; name: string | null };

type Org = {
  id: string;
  name: string;
  plan: string;
  users: AdminUser[];
  settings?: { exportSchedule: string } | null;
};

export default function SuperAdminDashboard() {
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/superadmin/orgs', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        setOrgs(Array.isArray(d) ? d : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading organizations...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Super Admin Dashboard</h1>
      <table className="min-w-full border border-gray-300 text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">Org Name</th>
            <th className="p-2 border">Plan</th>
            <th className="p-2 border">Admins</th>
            <th className="p-2 border">Export Schedule</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orgs.map((org) => (
            <tr key={org.id} className="hover:bg-gray-50">
              <td className="p-2 border">{org.name}</td>
              <td className="p-2 border">{org.plan}</td>
              <td className="p-2 border">
                {org.users?.length ? (
                  org.users.map((u) => (
                    <div key={u.id}>{u.name || u.email} ({u.email})</div>
                  ))
                ) : (
                  <span className="text-gray-500">No Admin</span>
                )}
              </td>
              <td className="p-2 border">{org.settings?.exportSchedule || 'daily'}</td>
              <td className="p-2 border text-center">
                <button className="px-2 py-1 bg-indigo-600 text-white rounded text-xs">Manage</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
