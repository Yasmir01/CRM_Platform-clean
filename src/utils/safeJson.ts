// src/utils/safeJson.ts

export function safeParse<T = any>(value: string | null, defaultValue: T): T {
  if (value === null || value === undefined) return defaultValue;
  try {
    return JSON.parse(value) as T;
  } catch (err) {
    try {
      // try to strip BOM and control characters then parse
      const cleaned = value.replace(/^[\uFEFF\u200B\u00A0]+/, '').trim();
      return JSON.parse(cleaned) as T;
    } catch (err2) {
      // If still failing, return default and warn in dev
      if (typeof window !== 'undefined') {
        // eslint-disable-next-line no-console
        console.warn('safeParse: failed to parse value, returning default', { value });
      }
      return defaultValue;
    }
  }
}
