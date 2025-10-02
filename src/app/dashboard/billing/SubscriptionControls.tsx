"use client";

import React, { useState } from "react";
import styles from "./SubscriptionControls.module.css";

type Props = {};

export default function SubscriptionControls(_: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // We now pass plan keys (basic/pro/enterprise) to the backend which maps to real Price IDs
  async function handleCheckout(plan: string) {
    try {
      setError(null);
      setLoading(true);
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to create checkout session');
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No url returned from checkout');
      }
    } catch (err: any) {
      console.error('Checkout error', err?.message || err);
      setError(err?.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.subscriptionControls}>
      <h2 className={styles.title}>Upgrade your plan</h2>
      <div className={styles.cards}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.planName}>Pro</h3>
            <div className={styles.planPrice}>$149 / month</div>
          </div>
          <p className={styles.planDescription}>Everything small teams need.</p>
          <button
            className={styles.upgradeButton}
            disabled={loading}
            onClick={() => handleCheckout('pro')}
          >
            {loading ? 'Redirecting…' : 'Upgrade to Pro'}
          </button>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.planName}>Enterprise</h3>
            <div className={styles.planPrice}>$200 / month</div>
          </div>
          <p className={styles.planDescription}>Advanced features and support.</p>
          <button
            className={styles.upgradeButton}
            disabled={loading}
            onClick={() => handleCheckout('enterprise')}
          >
            {loading ? 'Redirecting…' : 'Upgrade to Enterprise'}
          </button>
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}
    </div>
  );
}
