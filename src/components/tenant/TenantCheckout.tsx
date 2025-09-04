"use client";

import { useEffect, useState } from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

interface Policy { allowPartial: boolean; allowSplit: boolean; minPartialUsd: number }
interface Props { leaseId: string; tenantId: string }

export default function TenantCheckout({ leaseId, tenantId }: Props) {
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [amountDue, setAmountDue] = useState(0);
  const [payAmount, setPayAmount] = useState<number | ''>('');
  const [splitEmails, setSplitEmails] = useState<string[]>(['']);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { void fetchPolicy(); void fetchBalance(); }, []);

  async function fetchPolicy() {
    const res = await fetch(`/api/tenant/payment-policy?leaseId=${leaseId}`);
    if (!res.ok) return setPolicy({ allowPartial: true, allowSplit: true, minPartialUsd: 10 });
    const data = await res.json();
    setPolicy(data);
  }

  async function fetchBalance() {
    const res = await fetch(`/api/tenant/balance?leaseId=${leaseId}&tenantId=${tenantId}`);
    if (!res.ok) return setAmountDue(0);
    const data = await res.json();
    setAmountDue(Number(data.amountDue || 0));
  }

  function updateSplitEmail(idx: number, value: string) {
    const next = [...splitEmails];
    next[idx] = value;
    setSplitEmails(next);
  }

  async function handlePayment() {
    setError(null);
    const amt = typeof payAmount === 'string' ? Number(payAmount) : payAmount;
    if (!amt || amt <= 0) {
      setError('Please enter a valid payment amount.');
      return;
    }
    if (policy?.allowPartial && amt < Number(policy.minPartialUsd)) {
      setError(`Minimum partial payment is $${policy.minPartialUsd}.`);
      return;
    }
    if (!policy?.allowPartial && amt < Number(amountDue)) {
      setError('Partial payments are not allowed for this lease.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/tenant/payments', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leaseId, tenantId, amount: amt, splitEmails: policy?.allowSplit ? splitEmails.filter(Boolean) : [] })
      });
      if (res.ok) {
        await fetchBalance();
        setPayAmount('');
      } else {
        const data = await res.json();
        setError(data?.message || data?.error || 'Payment failed.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader title="Rent Payment" />
      <CardContent>
        <Stack spacing={2}>
          <Typography color="text.secondary">Amount Due: <b>${amountDue.toFixed(2)}</b></Typography>
          <TextField type="number" label="Payment Amount" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} inputProps={{ min: 0, step: 1 }} />

          {policy?.allowSplit && (
            <Stack spacing={1}>
              <Typography variant="body2" color="text.secondary">Split Payment (Optional)</Typography>
              {splitEmails.map((email, idx) => (
                <TextField key={idx} type="email" value={email} onChange={(e) => updateSplitEmail(idx, e.target.value)} placeholder="Enter roommate email" />
              ))}
              <Button variant="outlined" size="small" onClick={() => setSplitEmails([...splitEmails, ''])}>+ Add Another Roommate</Button>
            </Stack>
          )}

          {error && <Alert severity="error">{error}</Alert>}

          <Button variant="contained" onClick={handlePayment} disabled={loading}>{loading ? 'Processing...' : 'Pay Now'}</Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
