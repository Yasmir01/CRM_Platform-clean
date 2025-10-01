import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export async function generateReceiptPdf({
  receiptId,
  tenant,
  property,
  unit,
  amount,
  status,
  method,
  issuedAt,
}: {
  receiptId: string;
  tenant: string;
  property: string;
  unit: string;
  amount: string;
  status: string;
  method: string;
  issuedAt: Date;
}): Promise<string> {
  const outPath = path.join(process.cwd(), "tmp", `receipt-${receiptId}.pdf`);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const stream = fs.createWriteStream(outPath);
      doc.pipe(stream);

      doc.fontSize(20).text("Payment Receipt", { align: "center" });
      doc.moveDown();

      doc.fontSize(12).text(`Receipt #: ${receiptId}`);
      doc.text(`Tenant: ${tenant}`);
      doc.text(`Property/Unit: ${property} / ${unit}`);
      doc.text(`Amount: $${amount}`);
      doc.text(`Status: ${status}`);
      doc.text(`Method: ${method}`);
      doc.text(`Issued At: ${issuedAt.toLocaleString()}`);

      doc.end();

      stream.on("finish", () => resolve(outPath));
      stream.on("error", (err) => reject(err));
    } catch (err) {
      reject(err);
    }
  });
}
