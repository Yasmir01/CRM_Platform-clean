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
        if (!res.ok) return;
        const data = await res.json();
        if (mounted) setBranding(data || null);
      } catch (e) {
        console.error('Failed to fetch branding', e);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return <BrandingContext.Provider value={branding}>{children}</BrandingContext.Provider>;
}

export function useBranding() {
  return useContext(BrandingContext);
}
