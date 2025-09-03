import { useEffect, useState } from 'react';

type User = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  permissions: string | null;
  activePerms: string[];
};

export default function UserPermissionsGrid() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/users', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        setUsers(Array.isArray(d) ? d : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading users...</p>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">User Roles & Permissions</h1>
      <table className="min-w-full border border-gray-300 text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Role</th>
            <th className="p-2 border">Active Permissions</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="hover:bg-gray-50">
              <td className="p-2 border">{u.name || '-'}</td>
              <td className="p-2 border">{u.email}</td>
              <td className="p-2 border">{u.role}</td>
              <td className="p-2 border">
                <div className="flex flex-wrap gap-1">
                  {u.activePerms.map((p) => (
                    <span key={p} className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs">
                      {p}
                    </span>
                  ))}
                </div>
              </td>
              <td className="p-2 border text-center">
                <a
                  href={`/admin/users?id=${encodeURIComponent(u.id)}`}
                  className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-xs"
                >
                  Edit
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
