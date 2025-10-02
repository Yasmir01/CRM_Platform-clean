import React from "react";

interface PaymentHistoryTableProps {
  title?: string;
  showFilters?: boolean;
  showExport?: boolean;
  data?: any;
}

export default function PaymentHistoryTable({ title = "Payment History", showFilters = true, showExport = true }: PaymentHistoryTableProps) {
  return (
    <div className="payments-table">
      <div className="payments-header">
        <h3>{title}</h3>
        <div className="payments-actions">
          {showFilters && <button className="btn">Filters</button>}
          {showExport && <button className="btn">Export</button>}
        </div>
      </div>
      <table className="payments-list">
        <thead>
          <tr><th>Date</th><th>Amount</th><th>Method</th><th>Status</th></tr>
        </thead>
        <tbody>
          <tr><td colSpan={4} className="text-muted">No payments</td></tr>
        </tbody>
      </table>
    </div>
  );
}
