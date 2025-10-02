import React, { useState } from 'react';

export default function SendLease({ leaseId, signerEmail, signerName, docUrl }: any) {
  const [loading, setLoading] = useState(false);

  async function send() {
    setLoading(true);
    try {
      const res = await fetch('/api/esign/create-envelope', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ leaseId, signerEmail, signerName, docUrl }),
      });
      const data = await res.json();
      alert(res.ok ? 'Lease sent for signature! Envelope: ' + data.envelopeId : 'Failed: ' + (data.error || 'unknown'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <button onClick={send} disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded">
      {loading ? 'Sending...' : 'Send for Signature'}
    </button>
  );
}
