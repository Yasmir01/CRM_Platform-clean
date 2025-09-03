// Shim for packages importing `warning` as a default export under ESM.
export default function warning(condition: any, format?: string, ...args: any[]) {
  if (condition) return;
  const msg = format ? String(format).replace(/%s/g, () => String(args.shift())) : 'Warning';
  if (typeof console !== 'undefined' && console.warn) {
    console.warn(msg);
  }
}
