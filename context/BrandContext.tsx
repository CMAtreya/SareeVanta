'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

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
  brand: 'neelsareehouse',
  brandName: 'Neel Saree House',
  brandUpper: 'NEELSAREEHOUSE',
  brandTagline: 'MYSURU • ESTD. 2021',
  brandShort: 'NSH',
  setBrand: async () => {},
  isLoading: false,
});

export function BrandProvider({ children }: { children: React.ReactNode }) {
  const [brand, setBrandState] = useState<BrandType>('neelsareehouse');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Sync initial brand from server API on mount
  useEffect(() => {
    async function initBrand() {
      try {
        const res = await fetch('/api/admin/settings/brand', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data.brand === 'sareevanta' || data.brand === 'neelsareehouse') {
            setBrandState(data.brand);
          }
        }
      } catch (err) {
        console.error('[BrandContext] Error initializing brand setting:', err);
      } finally {
        setIsLoading(false);
      }
    }
    initBrand();
  }, []);

  const setBrand = async (newBrand: BrandType) => {
    setBrandState(newBrand);

    try {
      await fetch('/api/admin/settings/brand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brand: newBrand }),
      });
    } catch (err) {
      console.error('[BrandContext] Failed to persist brand setting:', err);
    }
  };

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
