// src/crm/services/LocalStorageService.ts

import { safeParse } from "../../utils/safeJson";

/**
 * LocalStorageService
 * Utility for managing CRM data persistence in browser localStorage
 */
export class LocalStorageService {
  private static readonly PREFIX = "crm_";

  /** Build a consistent key with crm_ prefix */
  private static buildKey(key: string): string {
    return `${LocalStorageService.PREFIX}${key}`;
  }

  /** Save any serializable data */
  static set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(
        LocalStorageService.buildKey(key),
        JSON.stringify(value)
      );
    } catch (err) {
      console.error("LocalStorageService.set failed", err);
    }
  }

  /** Load data and parse safely */
  static get<T>(key: string, fallback?: T): T | null {
    try {
      const raw = localStorage.getItem(LocalStorageService.buildKey(key));
      if (!raw) return fallback ?? null;
      return safeParse<T>(raw) ?? fallback ?? null;
    } catch (err) {
      console.error("LocalStorageService.get failed", err);
      return fallback ?? null;
    }
  }

  /** Remove a specific key */
  static remove(key: string): void {
    try {
      localStorage.removeItem(LocalStorageService.buildKey(key));
    } catch (err) {
      console.error("LocalStorageService.remove failed", err);
    }
  }

  /** Clear all crm_ keys */
  static clearAll(): void {
    try {
      Object.keys(localStorage).forEach((k) => {
        if (k.startsWith(LocalStorageService.PREFIX)) {
          localStorage.removeItem(k);
        }
      });
    } catch (err) {
      console.error("LocalStorageService.clearAll failed", err);
    }
  }
}
