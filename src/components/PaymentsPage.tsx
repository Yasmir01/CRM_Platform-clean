import React, { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

declare global { interface Window { __STRIPE_PUBLIC_KEY?: string } }

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || (typeof window !== 'undefined' ? window.__STRIPE_PUBLIC_KEY : undefined) || '');

function PaymentsInner() {
  const stripe = useStripe();
  const elements = useElements();
  const [amount, setAmount] = useState<number>(0);
  const [status, setStatus] = useState<string | null>(null);
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => { fetchPayments(); }, []);

  async function fetchPayments() {
    const res = await fetch('/api/tenant/payments', { credentials: 'include' });
    if (res.ok) setPayments(await res.json());
  }

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setStatus('Creating payment…');

    const piRes = await fetch('/api/tenant/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ amount, currency: 'usd', description: 'Rent payment' }),
    });
    if (!piRes.ok) { setStatus('Failed creating payment'); return; }
    const { clientSecret } = await piRes.json();

    setStatus('Confirming card…');
    const card = elements.getElement(CardElement)!;
    const pay = await stripe.confirmCardPayment(clientSecret, { payment_method: { card } });
    if ((pay as any).error) {
      setStatus('Payment failed: ' + (pay as any).error.message);
    } else {
      setStatus('Payment successful!');
      fetchPayments();
    }
  }

  return (
    <div>
      <h3>Make a Payment</h3>
      <form onSubmit={handlePay}>
        <label>Amount (USD)
          <input type="number" min="1" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
        </label>
        <div className="card-field">
          <CardElement />
        </div>
        <button type="submit" disabled={!stripe}>Pay</button>
      </form>

      {status && <p>{status}</p>}

      <h3>Your Payments</h3>
      <ul>
        {payments.map((p) => <li key={p.id}>{(p.amount / 100).toFixed(2)} {p.currency} — {p.status}</li>)}
      </ul>
    </div>
  );
}

export function PaymentsPage() {
  return (
    <Elements stripe={stripePromise as any}>
      <PaymentsInner />
    </Elements>
  );
}
