import { Product } from './products';

// Global shared in-memory and sessionStorage cache for instant 0ms PDP rendering
export const globalPdpCache = new Map<string, { product: Product; relatedProducts?: any[]; timestamp: number }>();

export function getCachedProduct(slug: string): { product: Product; relatedProducts?: any[] } | null {
  if (!slug) return null;
  const inMem = globalPdpCache.get(slug);
  if (inMem && Date.now() - inMem.timestamp < 300000) {
    return inMem;
  }
  return null;
}

export function setCachedProduct(slug: string, data: { product: Product; relatedProducts?: any[] }) {
  if (!slug || !data?.product) return;
  globalPdpCache.set(slug, { ...data, timestamp: Date.now() });
}

export function seedPdpCacheFromCatalog(product: Product) {
  if (!product?.slug) return;
  if (!globalPdpCache.has(product.slug)) {
    globalPdpCache.set(product.slug, {
      product,
      relatedProducts: [],
      timestamp: Date.now(),
    });
  }
}
