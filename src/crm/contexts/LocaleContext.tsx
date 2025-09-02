import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useValidatedLocale } from "../hooks/useValidatedLocale";

export type TranslationsMap = Record<string, string>;

export type LocaleContextValue = {
  locale: string;
  translations: TranslationsMap;
  switchLocale: (newLang: string) => Promise<void>;
};

const defaultContext: LocaleContextValue = {
  locale: "en",
  translations: {},
  switchLocale: async () => {},
};

export const LocaleContext = createContext<LocaleContextValue>(defaultContext);

async function fetchTranslations(lang: string): Promise<TranslationsMap> {
  try {
    const res = await fetch(`/i18n/${lang}.json`, { cache: "reload" });
    if (!res.ok) throw new Error("missing file");
    return await res.json();
  } catch {
    const fallback = await fetch(`/i18n/en.json`, { cache: "reload" });
    return fallback.json();
  }
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<string>("en");
  const [translations, setTranslations] = useState<TranslationsMap>({});

  // Determine supported locales from available translation files
  const supportedLocales = ["en", "fr"] as const;

  useEffect(() => {
    const browserLang = (navigator.language || "en").toLowerCase();
    const saved = (localStorage.getItem("preferredLocale") || undefined)?.toLowerCase();
    const { locale: valid } = useValidatedLocale(saved ?? browserLang, {
      supportedLocales,
      fallbackLocale: "en",
    });
    setLocale(valid);
    fetchTranslations(valid).then(setTranslations);
  }, []);

  const switchLocale = async (newLang: string) => {
    const { locale: valid } = useValidatedLocale(newLang, {
      supportedLocales,
      fallbackLocale: "en",
    });
    localStorage.setItem("preferredLocale", valid);
    setLocale(valid);
    setTranslations(await fetchTranslations(valid));
  };

  const value = useMemo<LocaleContextValue>(
    () => ({ locale, translations, switchLocale }),
    [locale, translations]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  return useContext(LocaleContext);
}

export function LocalizedText({ id, fallback }: { id: string; fallback?: string }) {
  const { translations } = useLocale();
  // If the key isn’t found, show the fallback (or the key itself)
  return <>{translations[id] ?? fallback ?? id}</>;
}
