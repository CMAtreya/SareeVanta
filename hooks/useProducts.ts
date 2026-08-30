import { useState, useEffect } from 'react';
import { Product } from '@/lib/products';

export interface UseProductsOptions {
  weave?: string;
  fabric?: string;
  occasion?: string;
  color?: string;
  search?: string;
  limit?: number;
}

// Global in-memory cache map for instant (0ms) SWR rendering
const globalProductCache = new Map<string, Product[]>();

export function useProducts(options: UseProductsOptions = {}) {
  const { weave, fabric, occasion, color, search, limit } = options;

  const queryParams = new URLSearchParams();
  if (weave) queryParams.set('weave', weave);
  if (fabric) queryParams.set('fabric', fabric);
  if (occasion) queryParams.set('occasion', occasion);
  if (color) queryParams.set('color', color);
  if (search) queryParams.set('q', search);
  if (limit) queryParams.set('limit', limit.toString());

  const cacheKey = queryParams.toString() || 'all_storefront_products';
  const initialCached = globalProductCache.get(cacheKey) || [];

  const [products, setProducts] = useState<Product[]>(initialCached);
  const [loading, setLoading] = useState<boolean>(!initialCached || initialCached.length === 0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadProducts() {
      if (!globalProductCache.has(cacheKey)) {
        setLoading(true);
      }
      try {
        const res = await fetch(`/api/products?${cacheKey}`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.products && Array.isArray(data.products)) {
            globalProductCache.set(cacheKey, data.products);
            setProducts(data.products);
          }
        } else if (isMounted && !globalProductCache.has(cacheKey)) {
          setProducts([]);
        }
      } catch (err: any) {
        console.warn('[useProducts Hook] API error:', err);
        if (isMounted && !globalProductCache.has(cacheKey)) {
          setProducts([]);
          setError(err?.message || 'Failed to fetch products');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, [cacheKey]);

  return { products, loading, error };
}
