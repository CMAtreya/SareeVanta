import { useState, useEffect } from 'react';
import { Product, products as fallbackProducts } from '@/lib/products';

export interface UseProductsOptions {
  weave?: string;
  fabric?: string;
  occasion?: string;
  color?: string;
  search?: string;
  limit?: number;
}

export function useProducts(options: UseProductsOptions = {}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { weave, fabric, occasion, color, search, limit } = options;

  useEffect(() => {
    let isMounted = true;

    async function loadProducts() {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (weave) queryParams.set('weave', weave);
        if (fabric) queryParams.set('fabric', fabric);
        if (occasion) queryParams.set('occasion', occasion);
        if (color) queryParams.set('color', color);
        if (search) queryParams.set('q', search);
        if (limit) queryParams.set('limit', limit.toString());

        const res = await fetch(`/api/products?${queryParams.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.products && Array.isArray(data.products)) {
            setProducts(data.products.length > 0 ? data.products : fallbackProducts);
          }
        } else if (isMounted) {
          setProducts(fallbackProducts);
        }
      } catch (err: any) {
        console.warn('[useProducts Hook] API error, using static fallback:', err);
        if (isMounted) {
          setProducts(fallbackProducts);
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
  }, [weave, fabric, occasion, color, search, limit]);

  return { products, loading, error };
}
