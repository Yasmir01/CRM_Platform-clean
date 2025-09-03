export type MaintenanceRecord = {
  id: string;
  tenantId: string;
  title: string;
  description: string;
  attachmentKey: string | null;
  status: 'open' | 'closed' | 'in_progress';
  createdAt: string;
  updatedAt: string;
};

export const maintenanceStore: MaintenanceRecord[] = [];
