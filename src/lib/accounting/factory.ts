import { AccountingProvider, ProviderName } from "./types";
import { quickbooksProvider } from "./providers/quickbooks";
import { xeroProvider } from "./providers/xero";
import { freshbooksProvider } from "./providers/freshbooks";

export function getProvider(name: ProviderName): AccountingProvider {
  switch (name) {
    case "quickbooks": return quickbooksProvider;
    case "xero": return xeroProvider;
    case "freshbooks": return freshbooksProvider;
    default: throw new Error("Unsupported provider");
  }
}
