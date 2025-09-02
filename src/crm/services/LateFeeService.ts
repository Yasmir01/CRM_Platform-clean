import { LocalStorageService } from './LocalStorageService';
import { Property } from '../contexts/CrmDataContext';

export type LateFeeMode = 'flat' | 'percent';
export interface LateFeeConfig {
  baseFee: number;
  dailyRate: number;
  percentageRate: number; // 0.05 for 5%
  graceDays: number;
  mode: LateFeeMode;
}

const DEFAULT_GLOBAL: LateFeeConfig = {
  baseFee: 10,
  dailyRate: 2,
  percentageRate: 0.05,
  graceDays: 5,
  mode: 'flat'
};

const KEY = 'lateFeeSettings';

export const LateFeeService = {
  getGlobalConfig(): LateFeeConfig {
    const cfg = LocalStorageService.getData<Partial<LateFeeConfig>>(KEY, {} as any);
    return { ...DEFAULT_GLOBAL, ...cfg } as LateFeeConfig;
  },
  saveGlobalConfig(cfg: LateFeeConfig) {
    LocalStorageService.saveData(KEY, cfg);
  },
  getEffectiveConfig(property: Partial<Property> | undefined, globalCfg?: LateFeeConfig): LateFeeConfig {
    const global = globalCfg || this.getGlobalConfig();
    if (!property) return global;
    const overrideEnabled = (property as any).lateFeeOverrideEnabled;
    if (overrideEnabled) {
      return {
        baseFee: (property as any).lateFeeBaseFee ?? global.baseFee,
        dailyRate: (property as any).lateFeeDailyRate ?? global.dailyRate,
        percentageRate: (property as any).lateFeePercentageRate ?? global.percentageRate,
        graceDays: (property as any).lateFeeGraceDays ?? global.graceDays,
        mode: (property as any).lateFeeMode ?? global.mode,
      } as LateFeeConfig;
    }
    return global;
  },
  calculateLateFee(invoiceAmount: number, dueDate: Date | string, paidDate: Date | string, config: LateFeeConfig): number {
    const { baseFee = 0, dailyRate = 0, percentageRate = 0, graceDays = 0, mode = 'flat' } = config || ({} as any);
    const msPerDay = 24 * 60 * 60 * 1000;
    const due = new Date(dueDate);
    const paid = new Date(paidDate);
    if (paid <= due) return 0;
    const totalDaysLate = Math.floor((paid.getTime() - due.getTime()) / msPerDay);
    const effectiveDaysLate = Math.max(totalDaysLate - graceDays, 0);
    if (effectiveDaysLate === 0) return 0;
    if (mode === 'percent') {
      const percentFee = invoiceAmount * percentageRate;
      return baseFee + percentFee;
    }
    const dailyAccrual = dailyRate * effectiveDaysLate;
    return baseFee + dailyAccrual;
  }
};
