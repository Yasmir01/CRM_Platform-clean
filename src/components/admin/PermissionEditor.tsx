import React, { useEffect, useState } from 'react';

const allPermissions = [
  'payments:read',
  'payments:create',
  'maintenance:create',
  'lease:read',
  'statements:read',
  'properties:read',
  'reports:read',
  'workorders:read',
  'workorders:update',
  'tenants:manage',
  'owners:manage',
  'maintenance:manage',
  'payments:manage',
  'users:manage',
];

export default function PermissionEditor({ userId }: { userId: string }) {
  const [perms, setPerms] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/users?id=${encodeURIComponent(userId)}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        setPerms(Array.isArray(d.permissions) ? d.permissions : []);
        setLoading(false);
      });
  }, [userId]);

  const toggle = (perm: string) => {
    setPerms((prev) => (prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]));
  };

  async function save() {
    await fetch('/api/admin/users/permissions', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ id: userId, permissions: perms }),
    });
    alert('Permissions updated!');
  }

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-4 border rounded bg-gray-50">
      <h2 className="font-bold mb-2">Edit Permissions</h2>
      <div className="grid grid-cols-2 gap-2">
        {allPermissions.map((p) => (
          <label key={p} className="flex items-center space-x-2">
            <input type="checkbox" checked={perms.includes(p)} onChange={() => toggle(p)} />
            <span>{p}</span>
          </label>
        ))}
      </div>
      <button onClick={save} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded">
        Save
      </button>
    </div>
  );
}
