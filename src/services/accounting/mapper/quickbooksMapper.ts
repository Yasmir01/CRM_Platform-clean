import { saveInvoice, savePayment, saveTenant } from "@/services/db/persistence";

export async function persistQuickBooksEntity(orgId: string | null, entityType: string, data: any) {
  const type = String(entityType || '').toLowerCase();
  switch (type) {
    case "invoice":
      return saveInvoice({
        orgId,
        externalId: String(data.Id),
        source: "quickbooks",
        tenantId: String(data.CustomerRef?.value || ""),
        amount: Number(data.TotalAmt || 0),
        status: Number(data.Balance || 0) > 0 ? "open" : "paid",
        dueDate: data.DueDate ? new Date(data.DueDate) : null,
        syncedAt: new Date(),
      });
    case "payment":
      return savePayment({
        orgId,
        externalId: String(data.Id),
        source: "quickbooks",
        tenantId: String(data.CustomerRef?.value || ""),
        amount: Number(data.TotalAmt || data.Amount || 0),
        method: String(data.PaymentMethodRef?.name || data.PaymentMethodRef?.value || "unknown"),
        status: "completed",
        syncedAt: new Date(),
      });
    case "customer":
      return saveTenant({
        orgId,
        externalId: String(data.Id),
        source: "quickbooks",
        name: `${data.GivenName || ""} ${data.FamilyName || ""}`.trim() || (data.DisplayName || "Unknown"),
        email: data.PrimaryEmailAddr?.Address || null,
        phone: data.PrimaryPhone?.FreeFormNumber || null,
        syncedAt: new Date(),
      });
    default:
      return null;
  }
}
