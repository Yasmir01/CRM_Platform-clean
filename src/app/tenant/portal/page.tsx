import { useEffect, useState } from "react";

export default function TenantPortal() {
  const [reminders, setReminders] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);

    Promise.all([
      fetch("/api/tenant/reminders").then((r) => r.json()).catch(() => []),
      fetch("/api/tenant/history").then((r) => r.json()).catch(() => []),
      fetch("/api/tenant/notifications").then((r) => r.json()).catch(() => []),
    ])
      .then(([rem, hist, notes]) => {
        setReminders(rem || []);
        setHistory(hist || []);
        setNotifications(notes || []);
      })
      .catch(() => {
        setReminders([]);
        setHistory([]);
        setNotifications([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  async function markNotificationRead(id: string) {
    // Optimistic UI update
    const prev = notifications;
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    setNotifications(updated);

    try {
      const res = await fetch(`/api/tenant/notifications/${id}`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to mark notification read");
    } catch (err) {
      // Revert on error and show a simple alert
      setNotifications(prev);
      // eslint-disable-next-line no-alert
      alert("Could not mark notification as read. Please try again.");
    }
  }

  async function markAllNotificationsRead() {
    const prev = notifications;
    // Optimistic: mark all locally
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);

    try {
      const res = await fetch("/api/tenant/notifications/mark-all", { method: "POST" });
      if (!res.ok) throw new Error("Failed to mark all notifications read");
    } catch (err) {
      setNotifications(prev);
      // eslint-disable-next-line no-alert
      alert("Could not mark all notifications as read. Please try again.");
    }
  }

  return (
    <div className="tenant-portal-container">
      <header className="portal-header">
        <h1 className="portal-title">Tenant Portal</h1>
      </header>

      <div className="portal-grid">
        {/* Reminders */}
        <section className="portal-section" aria-labelledby="reminders-title">
          <h2 id="reminders-title" className="section-title">Upcoming Reminders</h2>

          {reminders.length === 0 ? (
            <p className="empty-state">No reminders yet.</p>
          ) : (
            <ul className="reminders-list">
              {reminders.map((r) => (
                <li key={r.id} className="reminder-item">
                  <div className="reminder-main">
                    <strong className="reminder-type">{r.type}</strong>
                    <span className="reminder-message">{r.message}</span>
                  </div>
                  <div className="reminder-meta">{new Date(r.dueDate).toLocaleDateString()}</div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Notifications */}
        <section className="portal-section" aria-labelledby="notifications-title">
          <div className="section-header">
            <h2 id="notifications-title" className="section-title">Notifications</h2>
            <div className="section-actions">
              <div className="unread-badge" aria-hidden={unreadCount === 0}>
                {unreadCount > 0 ? `${unreadCount}` : ""}
              </div>
              <button
                type="button"
                onClick={markAllNotificationsRead}
                className="action-button mark-all-button"
                disabled={unreadCount === 0}
              >
                Mark all as read
              </button>
            </div>
          </div>

          {notifications.length === 0 ? (
            <p className="empty-state">No notifications yet.</p>
          ) : (
            <ul className="notifications-list">
              {notifications.map((n) => (
                <li
                  key={n.id}
                  className={`notification-item ${n.read ? "notification-read" : "notification-unread"}`}
                >
                  <div className="notification-content">
                    <div className="notification-message">{n.message}</div>
                    <div className="notification-meta">{new Date(n.createdAt).toLocaleString()}</div>
                  </div>

                  <div className="notification-actions">
                    {!n.read ? (
                      <button
                        type="button"
                        onClick={() => markNotificationRead(n.id)}
                        className="action-button mark-button"
                      >
                        Mark as read
                      </button>
                    ) : (
                      <span className="read-label">Read</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* History */}
        <section className="portal-section" aria-labelledby="history-title">
          <h2 id="history-title" className="section-title">History</h2>

          {history.length === 0 ? (
            <p className="empty-state">No history yet.</p>
          ) : (
            <ul className="history-list">
              {history.map((h) => (
                <li key={h.id} className="history-item">
                  <div className="history-main">
                    <strong className="history-type">{h.type}</strong>
                    <span className="history-details">{h.details}</span>
                  </div>
                  <div className="history-meta">{new Date(h.createdAt).toLocaleString()}</div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {loading && <div className="loading-indicator">Loading...</div>}
    </div>
  );
}
