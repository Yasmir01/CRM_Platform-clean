import { syncToQuickBooks } from './providers/quickbooks';
import { syncToXero } from './providers/xero';
import { syncToFreshBooks } from './providers/freshbooks';

export type Ledger = {
  payments: Array<{ amount: number; date: string; type: string }>;
  expenses: Array<{ amount: number; date: string; category: string; description?: string | null }>;
};

export async function syncLedger(provider: string, creds: any, ledger: Ledger) {
  switch (provider) {
    case 'quickbooks':
      return syncToQuickBooks(creds, ledger);
    case 'xero':
      return syncToXero(creds, ledger);
    case 'freshbooks':
      return syncToFreshBooks(creds, ledger);
    default:
      throw new Error('Unsupported provider');
  }
}
