import { useLocale } from "../contexts/LocaleContext";

export function useI18nFormat() {
  const { locale } = useLocale();

  const formatCurrency = (value: number, currency: string = "USD", options: Intl.NumberFormatOptions = {}) =>
    new Intl.NumberFormat(locale, { style: "currency", currency, ...options }).format(value);

  const formatNumber = (value: number, options: Intl.NumberFormatOptions = {}) =>
    new Intl.NumberFormat(locale, options).format(value);

  const formatDate = (date: string | number | Date, options: Intl.DateTimeFormatOptions = {}) =>
    new Date(date).toLocaleDateString(locale, options);

  const formatDateTime = (date: string | number | Date, options: Intl.DateTimeFormatOptions = {}) =>
    new Date(date).toLocaleString(locale, options);

  return { locale, formatCurrency, formatNumber, formatDate, formatDateTime } as const;
}
