// Shim for packages importing `invariant` as an ESM default which fails under some bundlers.
// Provides a minimal compatible implementation.
export default function invariant(condition: any, format?: string, ...args: any[]) {
  if (condition) return;
  if (format === undefined) {
    throw new Error('Invariant failed');
  }
  let index = 0;
  const message = String(format).replace(/%s/g, () => String(args[index++]))
  throw new Error(message);
}
