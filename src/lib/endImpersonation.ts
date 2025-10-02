export async function endImpersonation() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('impersonationToken') : null;
  if (!token) {
    if (typeof window !== 'undefined') window.location.href = '/crm/superadmin/subscriptions';
    return;
  }

  try {
    await fetch('/api/superadmin/impersonation/end', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
  } catch (err) {
    console.error('Failed to end impersonation:', err);
  } finally {
    try {
      localStorage.removeItem('impersonationToken');
    } catch {}
    if (typeof window !== 'undefined') window.location.href = '/crm/superadmin/subscriptions';
  }
}
