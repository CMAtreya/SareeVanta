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

  const queryString = queryParams.toString();
  const cacheKey = queryString || 'all';
  const initialCached = globalProductCache.get(cacheKey) || [];

  const [products, setProducts] = useState<Product[]>(initialCached);
  const [loading, setLoading] = useState<boolean>(!initialCached || initialCached.length === 0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    let lastFetchedAt = Date.now();

    async function loadProducts(isForced = false) {
      const now = Date.now();
      if (!isForced && now - lastFetchedAt < 30000 && globalProductCache.has(cacheKey)) {
        return;
      }
      lastFetchedAt = now;

      if (!globalProductCache.has(cacheKey)) {
        setLoading(true);
      }
      try {
        const fetchUrl = queryString ? `/api/products?${queryString}` : '/api/products';
        const res = await fetch(fetchUrl, { cache: 'no-store' });
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

    loadProducts(true);

    const handleSoftRevalidate = () => {
      if (document.visibilityState === 'visible') {
        loadProducts(false);
      }
    };

    const handleForcedRevalidate = () => {
      globalProductCache.clear();
      loadProducts(true);
    };

    window.addEventListener('focus', handleSoftRevalidate);
    document.addEventListener('visibilitychange', handleSoftRevalidate);
    window.addEventListener('sareevanta:products_updated', handleForcedRevalidate);
    window.addEventListener('storage', (e) => {
      if (e.key === 'sareevanta_last_product_update') {
        handleForcedRevalidate();
      }
    });

    return () => {
      isMounted = false;
      window.removeEventListener('focus', handleSoftRevalidate);
      document.removeEventListener('visibilitychange', handleSoftRevalidate);
      window.removeEventListener('sareevanta:products_updated', handleForcedRevalidate);
    };
  }, [cacheKey]);

  return { products, loading, error };
}
