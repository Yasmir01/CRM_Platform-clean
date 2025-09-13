"use client";

import React, { useEffect, useState } from "react";

type BillingInvoice = {
  id: string;
  number: string;
  amount: number;
  periodStart: string;
  periodEnd: string;
  pdfUrl: string;
  account?: { id: string; name?: string } | null;
};

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<BillingInvoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetch("/api/admin/invoices")
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
    <div className="admin-invoices-page p-8">
      <h1 className="admin-invoices-title text-2xl font-bold mb-6">All Subscriber Invoices</h1>

      {loading ? (
        <div className="admin-invoices-loading">Loading...</div>
      ) : (
        <div className="admin-invoices-table-wrap">
          <table className="admin-invoices-table w-full border-collapse text-sm">
            <thead>
              <tr className="admin-invoices-head bg-gray-100 text-left">
                <th className="admin-th p-2">Account</th>
                <th className="admin-th p-2">Invoice #</th>
                <th className="admin-th p-2">Period</th>
                <th className="admin-th p-2">Amount</th>
                <th className="admin-th p-2">Download</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="admin-tr border-t">
                  <td className="admin-td p-2">{inv.account?.name ?? "Unknown"}</td>
                  <td className="admin-td p-2">{inv.number}</td>
                  <td className="admin-td p-2">
                    {new Date(inv.periodStart).toLocaleDateString()} - {new Date(inv.periodEnd).toLocaleDateString()}
                  </td>
                  <td className="admin-td p-2">${(inv.amount / 100).toFixed(2)}</td>
                  <td className="admin-td p-2">
                    {inv.pdfUrl ? (
                      <a className="admin-download text-blue-600 underline" href={inv.pdfUrl} target="_blank" rel="noreferrer">
                        Download PDF
                      </a>
                    ) : (
                      <span className="admin-no-pdf text-gray-500">N/A</span>
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
