export function exportToCSV(users: any[]) {
  const headers = ["Name", "Email", "Role", "Active Permissions"];
  const rows = users.map((u) => [u.name || "-", u.email, u.role, u.activePerms.join(" | ")]);
  const csvContent = [headers, ...rows]
    .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "user_permissions.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

import jsPDF from "jspdf";
import "jspdf-autotable";

export function exportToPDF(users: any[]) {
  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text("User Roles & Permissions", 14, 20);
  const tableData = users.map((u) => [u.name || "-", u.email, u.role, u.activePerms.join(", ")]);
  (doc as any).autoTable({
    startY: 30,
    head: [["Name", "Email", "Role", "Active Permissions"]],
    body: tableData,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [79, 70, 229] },
  });
  doc.save("user_permissions.pdf");
}
