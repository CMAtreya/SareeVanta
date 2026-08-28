// Lightweight In-Memory TTL Cache for High-Frequency Server Reads
type CacheEntry<T> = {
  data: T;
  expiresAt: number;
};

const memoryStore = new Map<string, CacheEntry<any>>();

/**
 * Get an item from memory cache if not expired
 */
export function getCache<T>(key: string): T | null {
  const entry = memoryStore.get(key);
  if (!entry) return null;

  if (Date.now() > entry.expiresAt) {
    memoryStore.delete(key);
    return null;
  }

  return entry.data as T;
}

/**
 * Set an item in memory cache with a Time-To-Live in seconds (default: 60s)
 */
export function setCache<T>(key: string, data: T, ttlSeconds: number = 60): void {
  memoryStore.set(key, {
    data,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}

/**
 * Invalidate a specific cache key or prefix
 */
export function invalidateCache(keyOrPrefix: string): void {
  if (memoryStore.has(keyOrPrefix)) {
    memoryStore.delete(keyOrPrefix);
    return;
  }

  // Prefix invalidation
  for (const key of memoryStore.keys()) {
    if (key.startsWith(keyOrPrefix)) {
      memoryStore.delete(key);
    }
  }
}
