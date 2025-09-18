"use client";

import React, { useEffect, useState } from "react";

interface ServiceProvider {
  id: string;
  name: string;
  serviceType: string;
  phone?: string;
  email?: string;
}

export default function ServiceProvidersPage() {
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [newProvider, setNewProvider] = useState({
    name: "",
    serviceType: "",
    phone: "",
    email: "",
  });

  useEffect(() => {
    let mounted = true;
    fetch("/api/service-providers")
      .then((res) => res.json())
      .then((data) => {
        if (!mounted) return;
        // support both shapes: array or { data|providers }
        const list = Array.isArray(data) ? data : (data.data ?? data.providers ?? data);
        setProviders(list || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        if (mounted) {
          setProviders([]);
          setLoading(false);
        }
      });
    return () => { mounted = false; };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/service-providers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newProvider),
    });
    if (res.ok) {
      const created = await res.json();
      setProviders((prev) => [...prev, created]);
      setNewProvider({ name: "", serviceType: "", phone: "", email: "" });
    } else {
      console.error('Failed to create provider', await res.text());
      alert('Failed to create provider');
    }
  };

  if (loading) return <p className="p-4">Loading service providers...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Service Providers</h1>

      {/* Add New Provider Form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <input
          type="text"
          placeholder="Name"
          value={newProvider.name}
          onChange={(e) => setNewProvider({ ...newProvider, name: e.target.value })}
          className="border rounded p-2"
          required
        />
        <input
          type="text"
          placeholder="Service Type"
          value={newProvider.serviceType}
          onChange={(e) => setNewProvider({ ...newProvider, serviceType: e.target.value })}
          className="border rounded p-2"
          required
        />
        <input
          type="text"
          placeholder="Phone"
          value={newProvider.phone}
          onChange={(e) => setNewProvider({ ...newProvider, phone: e.target.value })}
          className="border rounded p-2"
        />
        <input
          type="email"
          placeholder="Email"
          value={newProvider.email}
          onChange={(e) => setNewProvider({ ...newProvider, email: e.target.value })}
          className="border rounded p-2"
        />
        <button type="submit" className="col-span-1 md:col-span-2 bg-blue-600 text-white py-2 px-4 rounded">
          Add Provider
        </button>
      </form>

      {/* Provider List */}
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-4 py-2 text-left">Name</th>
            <th className="border px-4 py-2 text-left">Service Type</th>
            <th className="border px-4 py-2 text-left">Phone</th>
            <th className="border px-4 py-2 text-left">Email</th>
          </tr>
        </thead>
        <tbody>
          {providers.map((provider) => (
            <tr key={provider.id} className="hover:bg-gray-50">
              <td className="border px-4 py-2">{provider.name}</td>
              <td className="border px-4 py-2">{provider.serviceType}</td>
              <td className="border px-4 py-2">{provider.phone || "-"}</td>
              <td className="border px-4 py-2">{provider.email || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
