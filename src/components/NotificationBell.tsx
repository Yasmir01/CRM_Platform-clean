import { useEffect, useState } from 'react';

type Notification = { id: string; message: string; createdAt: string; read: boolean };

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    fetch('/api/user/notifications', { credentials: 'include' })
      .then((r) => r.json())
      .then(setNotifications)
      .catch(() => {});
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative">
      <button className="relative">🔔{unreadCount > 0 && (
        <span className="absolute -top-1 -right-2 bg-red-600 text-white text-xs rounded-full px-1">{unreadCount}</span>
      )}</button>
      <div className="absolute right-0 mt-2 w-64 bg-white border rounded shadow-lg z-50">
        {notifications.length === 0 ? (
          <p className="p-2 text-sm text-gray-500">No notifications</p>
        ) : (
          notifications.map((n) => (
            <div key={n.id} className="p-2 text-sm border-b last:border-0">
              {n.message}
              <div className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleString()}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
