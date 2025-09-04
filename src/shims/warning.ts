// Minimal warning shim to satisfy packages expecting a default export from 'warning'
export default function warning(condition: any, ...args: any[]) {
  if (condition) return;
  const [message, ...rest] = args;
  try {
    // eslint-disable-next-line no-console
    console.warn(message ?? 'Warning triggered', ...rest);
  } catch {}
}
