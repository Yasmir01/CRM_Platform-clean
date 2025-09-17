// src/utils/cleanLocalStorage.ts

export function cleanLocalStorage(): void {
  if (typeof window === "undefined" || !window.localStorage) return;

  try {
    const keys = Object.keys(localStorage);
    for (const key of keys) {
      try {
        const val = localStorage.getItem(key);
        if (!val) continue;
        const trimmed = val.trim();

        // Detect obvious JS/TS module or function text that was accidentally saved
        const startsWithImportOrExport = /^import\s+|^export\s+/.test(trimmed);
        const looksLikeModule = /(^import\s+)|(^export\s+)|(^const\s+\w+\s*=)|(^function\s+\w+\s*\()/.test(trimmed);

        if (startsWithImportOrExport || looksLikeModule) {
          // Remove suspicious non-JSON content to prevent runtime JSON.parse errors
          // Log for debugging in dev only
          try {
            // eslint-disable-next-line no-console
            console.warn('cleanLocalStorage: removing suspicious localStorage key', key);
          } catch (e) {}
          localStorage.removeItem(key);
          continue;
        }

        // If value looks like code snippet referencing "import {", remove it as well
        if (trimmed.startsWith('import {')) {
          try { console.warn('cleanLocalStorage: removing import-starting key', key); } catch (e) {}
          localStorage.removeItem(key);
          continue;
        }

        // Otherwise, leave the key alone. We'll avoid aggressive removals so we don't break
        // keys that are plain strings used elsewhere.
      } catch (inner) {
        // ignore per-key errors and continue
        // eslint-disable-next-line no-console
        console.error('cleanLocalStorage: error processing key', key, inner);
      }
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('cleanLocalStorage: unexpected error', err);
  }
}
