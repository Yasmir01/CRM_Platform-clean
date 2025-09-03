import fs from 'fs';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export async function exportToCSVFile(users: any[], filePath: string) {
  const headers = ['Name', 'Email', 'Role', 'Active Permissions'];
  const rows = users.map((u) => [u.name || '-', u.email, u.role, u.activePerms.join(' | ')]);
  const csvContent = [headers, ...rows]
    .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
    .join('\n');
  fs.writeFileSync(filePath, csvContent);
  return filePath;
}

export async function exportToPDFFile(users: any[], filePath: string) {
  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text('User Roles & Permissions', 14, 20);

  const tableData = users.map((u) => [u.name || '-', u.email, u.role, u.activePerms.join(', ')]);
  (doc as any).autoTable({
    startY: 30,
    head: [['Name', 'Email', 'Role', 'Active Permissions']],
    body: tableData,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [79, 70, 229] },
  });

  const buffer = doc.output('arraybuffer');
  fs.writeFileSync(filePath, Buffer.from(buffer));
  return filePath;
}
