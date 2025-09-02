import { useMemo } from "react";

export function validateLocale(
  rawLocale: string | undefined,
  options?: {
    supportedLocales?: readonly string[];
    fallbackLocale?: string;
  }
) {
  const {
    supportedLocales = ["en", "en-us", "es", "es-es", "fr", "fr-fr", "de", "de-de"],
    fallbackLocale = "en",
  } = options ?? {};

  const isWellFormedBCP47 = (locale: string) => {
    const trimmed = locale.trim();
    const bcp47Regex = /^[a-zA-Z]{2,3}([_-][a-zA-Z0-9]{2,8})*$/;
    return bcp47Regex.test(trimmed);
  };

  if (!rawLocale) {
    return { locale: fallbackLocale, isValid: false } as const;
  }

  const normalized = rawLocale.replace("_", "-").toLowerCase();

  if (!isWellFormedBCP47(normalized)) {
    return { locale: fallbackLocale, isValid: false } as const;
  }

  if (supportedLocales.length && !supportedLocales.includes(normalized)) {
    return { locale: fallbackLocale, isValid: false } as const;
  }

  return { locale: normalized, isValid: true } as const;
}

/**
 * React hook wrapper if you want memoization in components.
 */
export function useValidatedLocale(
  rawLocale: string | undefined,
  options?: {
    supportedLocales?: readonly string[];
    fallbackLocale?: string;
  }
) {
  return useMemo(() => validateLocale(rawLocale, options), [rawLocale, options?.fallbackLocale, Array.isArray(options?.supportedLocales) ? options!.supportedLocales!.join("|") : "no-list"]);
}
