// Minimal implementation of lodash/chunk with the same signature
export default function chunk<T>(array: readonly T[] | null | undefined, size: number = 1): T[][] {
  const result: T[][] = [];
  if (!array || size < 1) return result;
  const len = array.length;
  for (let i = 0; i < len; i += size) {
    result.push(array.slice(i, i + size) as T[]);
  }
  return result;
}
