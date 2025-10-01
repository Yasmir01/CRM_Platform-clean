import jsPDF from "jspdf";
import "jspdf-autotable";

type ReceiptData = {
  id: string;
  tenant: string;
  property: string;
  unit: string;
  amount: string;
  status: string;
  method: string;
  issuedAt: string;
};

export function generateReceiptPdf(data: ReceiptData) {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("Payment Receipt", 14, 22);

  doc.setFontSize(12);
  doc.text(`Receipt #: ${data.id}`, 14, 32);
  doc.text(`Tenant: ${data.tenant}`, 14, 40);
  doc.text(`Property/Unit: ${data.property} / ${data.unit}`, 14, 48);
  doc.text(`Amount: $${data.amount}`, 14, 56);
  doc.text(`Status: ${data.status}`, 14, 64);
  doc.text(`Method: ${data.method}`, 14, 72);
  doc.text(`Date: ${data.issuedAt}`, 14, 80);

  doc.save(`receipt-${data.id}.pdf`);
}

export function exportPaymentsPdf(rows: ReceiptData[]) {
  const doc = new jsPDF();
  doc.text("Payments Report", 14, 16);

  const tableData = rows.map((r) => [
    r.id,
    r.tenant,
    `${r.property}/${r.unit}`,
    `$${r.amount}`,
    r.status,
    r.method,
    r.issuedAt,
  ]);

  (doc as any).autoTable({
    head: [["Receipt #", "Tenant", "Property/Unit", "Amount", "Status", "Method", "Date"]],
    body: tableData,
    startY: 24,
  });

  doc.save("payments-report.pdf");
}
