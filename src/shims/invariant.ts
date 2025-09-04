// Minimal invariant shim to satisfy packages expecting a default export from 'invariant'
export default function invariant(condition: any, ...args: any[]) {
  if (condition) return;
  const message = args && args.length ? String(args[0]) : 'Invariant failed';
  const error = new Error(message);
  (error as any).name = 'Invariant Violation';
  throw error;
}
