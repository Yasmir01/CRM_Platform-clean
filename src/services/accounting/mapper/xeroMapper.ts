import { saveInvoice, savePayment, saveTenant } from "@/services/db/persistence";

export async function persistXeroEntity(orgId: string | null, resourceType: string, data: any) {
  const type = String(resourceType || '').toLowerCase();
  switch (type) {
    case "invoices":
    case "invoice":
      return saveInvoice({
        orgId,
        externalId: String(data.InvoiceID || data.InvoiceId || data.InvoiceId),
        source: "xero",
        tenantId: String(data.Contact?.ContactID || data.Contact?.ContactId || ""),
        amount: Number(data.Total || data.AmountDue || 0),
        status: String(data.Status || '').toLowerCase() || 'open',
        dueDate: data.DueDate ? new Date(data.DueDate) : null,
        syncedAt: new Date(),
      });
    case "payments":
    case "payment":
      return savePayment({
        orgId,
        externalId: String(data.PaymentID || data.PaymentId),
        source: "xero",
        tenantId: String(data.Contact?.ContactID || data.Contact?.ContactId || ""),
        amount: Number(data.Amount || 0),
        method: String(data.PaymentType || data.Reference || "unknown"),
        status: "completed",
        syncedAt: new Date(),
      });
    case "contacts":
    case "contact":
      return saveTenant({
        orgId,
        externalId: String(data.ContactID || data.ContactId),
        source: "xero",
        name: String(data.Name || "Unknown"),
        email: data.EmailAddress || null,
        phone: data.Phones?.[0]?.PhoneNumber || null,
        syncedAt: new Date(),
      });
    default:
      return null;
  }
}
