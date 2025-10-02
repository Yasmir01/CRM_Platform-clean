import React, { useState } from 'react';

export default function BillingPage() {
  const [loading, setLoading] = useState(false);

  async function startCheckout(priceId: string) {
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ priceId }),
      });
      const data = await res.json();
      if (data?.url) {
        window.location.href = data.url;
      } else {
        console.error('No checkout url', data);
        alert('Failed to start checkout');
      }
    } catch (e) {
      console.error(e);
      alert('Failed to start checkout');
    } finally {
      setLoading(false);
    }
  }

  const proPrice = (import.meta.env.VITE_STRIPE_PRICE_PRO as string) || (window as any).__STRIPE_PRICE_PRO || '';
  const enterprisePrice = (import.meta.env.VITE_STRIPE_PRICE_ENTERPRISE as string) || (window as any).__STRIPE_PRICE_ENTERPRISE || '';

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Billing</h1>
      <div className="grid gap-6 md:grid-cols-3">
        <div className="border p-4 rounded shadow">
          <h2 className="font-bold">Free</h2>
          <p>$0 / month</p>
        </div>
        <div className="border p-4 rounded shadow">
          <h2 className="font-bold">Pro</h2>
          <p>$29 / month</p>
          <button onClick={() => startCheckout(proPrice)} disabled={loading || !proPrice} className="bg-blue-600 text-white px-4 py-2 rounded mt-2">
            Upgrade to Pro
          </button>
        </div>
        <div className="border p-4 rounded shadow">
          <h2 className="font-bold">Enterprise</h2>
          <p>$99 / month</p>
          <button onClick={() => startCheckout(enterprisePrice)} disabled={loading || !enterprisePrice} className="bg-green-600 text-white px-4 py-2 rounded mt-2">
            Upgrade to Enterprise
          </button>
        </div>
      </div>
    </div>
  );
}
