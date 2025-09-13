"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

type Branding = {
  name: string;
  logoUrl?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
} | null;

const BrandingContext = createContext<Branding>(null);

export function BrandingProvider({ children }: { children: React.ReactNode }) {
  const [branding, setBranding] = useState<Branding>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/branding');
        if (res.ok) {
          const contentType = res.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            const data = await res.json();
            if (mounted) setBranding(data || null);
            return;
          }
          // non-json response — log and fall back
          const text = await res.text();
          console.warn('Branding endpoint did not return JSON (falling back):', text.slice(0, 200));
        } else {
          console.warn('Branding API returned non-OK status, falling back:', res.status);
        }
      } catch (e) {
        console.warn('Failed to fetch /api/branding, falling back to /branding.json', e);
      }

      // Fallback: try static public/branding.json (useful in dev when serverless API isn't available)
      try {
        const res2 = await fetch('/branding.json');
        if (!res2.ok) return;
        const data2 = await res2.json();
        if (mounted) setBranding(data2 || null);
      } catch (e) {
        console.error('Failed to load fallback branding', e);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return <BrandingContext.Provider value={branding}>{children}</BrandingContext.Provider>;
}

export function useBranding() {
  return useContext(BrandingContext);
}
