"use client";
import React, { useEffect, useState } from "react";

interface ServiceProvider {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: { id: string; name: string };
}

export default function ServiceProvidersPage() {
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/service-providers")
      .then((res) => res.json())
      .then((data) => {
        setProviders(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching service providers:", err);
        setProviders([]);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="p-4">Loading service providers...</p>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Service Providers</h1>
      <table className="w-full border-collapse border border-gray-300 shadow-md rounded-lg">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 p-2 text-left">Name</th>
            <th className="border border-gray-300 p-2 text-left">Email</th>
            <th className="border border-gray-300 p-2 text-left">Phone</th>
            <th className="border border-gray-300 p-2 text-left">Company</th>
          </tr>
        </thead>
        <tbody>
          {providers.map((p) => (
            <tr key={p.id} className="hover:bg-gray-50">
              <td className="border border-gray-300 p-2">{p.name}</td>
              <td className="border border-gray-300 p-2">{p.email || "-"}</td>
              <td className="border border-gray-300 p-2">{p.phone || "-"}</td>
              <td className="border border-gray-300 p-2">{p.company?.name || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
