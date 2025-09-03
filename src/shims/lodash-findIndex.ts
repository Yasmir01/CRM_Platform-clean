// Minimal lodash/findIndex implementation with default export
export default function findIndex<T>(
  array: readonly T[] | null | undefined,
  predicate?: ((value: T, index: number, array: readonly T[]) => boolean) | Partial<T> | any,
  fromIndex: number = 0
): number {
  if (!array || !Array.isArray(array)) return -1;
  const start = Math.max(0, fromIndex | 0);
  const pred = normalizePredicate(predicate);
  for (let i = start; i < array.length; i++) {
    if (pred(array[i], i, array)) return i;
  }
  return -1;
}

function normalizePredicate<T>(
  predicate?: ((value: T, index: number, array: readonly T[]) => boolean) | Partial<T> | any
): (value: T, index: number, array: readonly T[]) => boolean {
  if (typeof predicate === 'function') return predicate as any;
  if (predicate && typeof predicate === 'object') {
    const keys = Object.keys(predicate);
    return (v: any) => keys.every((k) => v != null && v[k] === (predicate as any)[k]);
  }
  return (v: any) => v === predicate;
}
