'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type BrandType = 'neelsareehouse' | 'sareevanta';

export interface BrandContextType {
  brand: BrandType;
  brandName: string;
  brandUpper: string;
  brandTagline: string;
  brandShort: string;
  setBrand: (brand: BrandType) => Promise<void>;
  isLoading: boolean;
}

const BrandContext = createContext<BrandContextType>({
  brand: 'sareevanta',
  brandName: 'SareeVanta',
  brandUpper: 'SAREEVANTA',
  brandTagline: 'ROYAL SILKS • HANDLOOM GUILD',
  brandShort: 'SV',
  setBrand: async () => {},
  isLoading: false,
});

function getCookieBrand(): BrandType | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|;\s*)admin_active_brand=(neelsareehouse|sareevanta)(?:;|$)/);
  return match ? (match[1] as BrandType) : null;
}

export function BrandProvider({
  children,
  initialBrand,
}: {
  children: React.ReactNode;
  initialBrand?: BrandType;
}) {
  // Initialize immediately from cookie or prop to prevent any flash on reload
  const [brand, setBrandState] = useState<BrandType>(() => {
    if (initialBrand) return initialBrand;
    const cookieVal = getCookieBrand();
    if (cookieVal) return cookieVal;
    return 'sareevanta';
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Sync with multi-tab broadcasts and custom events for 0ms cross-app reactivity
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'admin_active_brand' && (e.newValue === 'sareevanta' || e.newValue === 'neelsareehouse')) {
        setBrandState(e.newValue as BrandType);
      }
    };

    const handleCustomEvent = (e: Event) => {
      const customEvent = e as CustomEvent<BrandType>;
      if (customEvent.detail === 'sareevanta' || customEvent.detail === 'neelsareehouse') {
        setBrandState(customEvent.detail);
      }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('brand_change', handleCustomEvent);

    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('sareevanta_brand_sync');
      channel.onmessage = (event) => {
        if (event.data === 'sareevanta' || event.data === 'neelsareehouse') {
          setBrandState(event.data);
        }
      };
    } catch (err) {
      // BroadcastChannel not available in all environments
    }

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('brand_change', handleCustomEvent);
      if (channel) channel.close();
    };
  }, []);

  const setBrand = useCallback(async (newBrand: BrandType) => {
    // 1. Instant 0ms state update (no refresh needed)
    setBrandState(newBrand);

    // 2. Synchronous cookie write for instant zero-flash SSR on next load
    if (typeof document !== 'undefined') {
      document.cookie = `admin_active_brand=${newBrand}; path=/; max-age=31536000; SameSite=Lax`;
      try {
        localStorage.setItem('admin_active_brand', newBrand);
      } catch (e) {}

      // 3. Broadcast across components and tabs immediately
      window.dispatchEvent(new CustomEvent('brand_change', { detail: newBrand }));
      try {
        const channel = new BroadcastChannel('sareevanta_brand_sync');
        channel.postMessage(newBrand);
        channel.close();
      } catch (e) {}
    }

    // 4. Persist to server API & database
    try {
      await fetch('/api/admin/settings/brand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brand: newBrand }),
      });
    } catch (err) {
      console.error('[BrandContext] Failed to persist brand setting:', err);
    }
  }, []);

  const brandName = brand === 'sareevanta' ? 'SareeVanta' : 'Neel Saree House';
  const brandUpper = brand === 'sareevanta' ? 'SAREEVANTA' : 'NEELSAREEHOUSE';
  const brandTagline = brand === 'sareevanta' ? 'ROYAL SILKS • HANDLOOM GUILD' : 'MYSURU • ESTD. 2021';
  const brandShort = brand === 'sareevanta' ? 'SV' : 'NSH';

  return (
    <BrandContext.Provider
      value={{
        brand,
        brandName,
        brandUpper,
        brandTagline,
        brandShort,
        setBrand,
        isLoading,
      }}
    >
      {children}
    </BrandContext.Provider>
  );
}

export function useBrand() {
  return useContext(BrandContext);
}
