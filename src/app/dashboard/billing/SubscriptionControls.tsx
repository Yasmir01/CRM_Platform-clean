"use client";

import React, { useState } from "react";
import styles from "./SubscriptionControls.module.css";

type Props = {};

export default function SubscriptionControls(_: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pricePro = process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO || "";
  const priceEnterprise = process.env.NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE || "";

  async function handleCheckout(priceId: string) {
    try {
      setError(null);
      setLoading(true);
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
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
            <div className={styles.planPrice}>$29 / month</div>
          </div>
          <p className={styles.planDescription}>Everything small teams need.</p>
          <button
            className={styles.upgradeButton}
            disabled={loading || !pricePro}
            onClick={() => handleCheckout(pricePro)}
          >
            {loading ? 'Redirecting…' : 'Upgrade to Pro'}
          </button>
          {!pricePro && <div className={styles.hint}>Price not configured</div>}
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.planName}>Enterprise</h3>
            <div className={styles.planPrice}>Custom pricing</div>
          </div>
          <p className={styles.planDescription}>Advanced features and support.</p>
          <button
            className={styles.upgradeButton}
            disabled={loading || !priceEnterprise}
            onClick={() => handleCheckout(priceEnterprise)}
          >
            {loading ? 'Redirecting…' : 'Upgrade to Enterprise'}
          </button>
          {!priceEnterprise && <div className={styles.hint}>Price not configured</div>}
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}
    </div>
  );
}
