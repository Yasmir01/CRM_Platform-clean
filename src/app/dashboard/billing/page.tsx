"use client";

import React, { useEffect, useState } from "react";

type Invoice = {
  id: string;
  number: string;
  amount: number;
  periodStart: string;
  periodEnd: string;
  pdfUrl: string;
  createdAt: string;
};

export default function BillingHistory() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetch("/api/invoices")
      .then((res) => res.json())
      .then((data) => {
        if (!mounted) return;
        if (Array.isArray(data)) setInvoices(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="billing-history-container p-8">
      <h1 className="billing-history-title text-2xl font-bold mb-6">Billing History</h1>

      {loading ? (
        <div className="billing-loading">Loading...</div>
      ) : (
        <div className="billing-table-wrapper">
          <table className="billing-table w-full border-collapse border">
            <thead>
              <tr className="billing-table-head bg-gray-100 text-left">
                <th className="billing-th p-2">Invoice #</th>
                <th className="billing-th p-2">Period</th>
                <th className="billing-th p-2">Amount</th>
                <th className="billing-th p-2">Download</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="billing-row border-t">
                  <td className="billing-cell p-2">{inv.number}</td>
                  <td className="billing-cell p-2">
                    {new Date(inv.periodStart).toLocaleDateString()} - {new Date(inv.periodEnd).toLocaleDateString()}
                  </td>
                  <td className="billing-cell p-2">${(inv.amount / 100).toFixed(2)}</td>
                  <td className="billing-cell p-2">
                    {inv.pdfUrl ? (
                      <a className="billing-download text-blue-600 underline" href={inv.pdfUrl} target="_blank" rel="noreferrer">
                        Download PDF
                      </a>
                    ) : (
                      <span className="billing-no-pdf text-gray-500">N/A</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
