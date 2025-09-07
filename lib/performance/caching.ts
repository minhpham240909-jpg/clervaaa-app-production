import React from 'react';
import { logger } from '@/lib/logger';

// Client-side caching utilities for better performance

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class MemoryCache<T = any> {
  private cache = new Map<string, CacheEntry<T>>();
  private maxSize: number;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(maxSize = 100, cleanupIntervalMs = 5 * 60 * 1000) {
    this.maxSize = maxSize;
    
    // Auto cleanup expired entries
    if (typeof window !== 'undefined') {
      this.cleanupInterval = setInterval(() => {
        this.cleanup();
      }, cleanupIntervalMs);
    }
  }

  set(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    // Remove oldest entry if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of Array.from(this.cache.entries())) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  size(): number {
    return this.cache.size;
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.clear();
  }
}

// Export CacheManager as alias to MemoryCache for compatibility
export const CacheManager = MemoryCache;

// Global caches for different types of data
export const apiCache = new MemoryCache<any>(50, 5 * 60 * 1000); // 5 minutes TTL
export const userCache = new MemoryCache<any>(20, 15 * 60 * 1000); // 15 minutes TTL
export const staticDataCache = new MemoryCache<any>(100, 60 * 60 * 1000); // 1 hour TTL

// Utility functions for common caching patterns
export const CacheUtils = {
  // Cache API responses
  async cachedApiCall<T>(
    cacheKey: string,
    apiCall: () => Promise<T>,
    ttl: number = 5 * 60 * 1000
  ): Promise<T> {
    // Check cache first
    const cached = apiCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Make API call and cache result
    try {
      const result = await apiCall();
      apiCache.set(cacheKey, result, ttl);
      return result;
    } catch (error) {
      // Don't cache errors
      throw error;
    }
  },

  // Cache user data
  cacheUserData(userId: string, userData: any, ttl: number = 15 * 60 * 1000): void {
    userCache.set(`user:${userId}`, userData, ttl);
  },

  getCachedUserData(userId: string): any | null {
    return userCache.get(`user:${userId}`);
  },

  // Cache static data like subjects, universities, etc.
  cacheStaticData(key: string, data: any, ttl: number = 60 * 60 * 1000): void {
    staticDataCache.set(key, data, ttl);
  },

  getCachedStaticData(key: string): any | null {
    return staticDataCache.get(key);
  },

  // Generate cache key from parameters
  generateKey(prefix: string, params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map((key: any) => `${key}=${JSON.stringify(params[key])}`)
      .join('&');
    return `${prefix}:${sortedParams}`;
  },

  // Invalidate cache entries by pattern
  invalidatePattern(pattern: RegExp, cache: MemoryCache = apiCache): void {
    const keys = Array.from((cache as any).cache.keys());
    keys.forEach(key => {
      if (pattern.test(key as string)) {
        cache.delete(key as string);
      }
    });
  },

  // Pre-warm cache with frequently used data
  async preWarmCache(
    entries: Array<{
      key: string;
      fetcher: () => Promise<any>;
      ttl?: number;
      cache?: MemoryCache;
    }>
  ): Promise<void> {
    const promises = entries.map(async ({ key, fetcher, ttl, cache = apiCache }) => {
      try {
        const data = await fetcher();
        cache.set(key, data, ttl);
      } catch (error) {
        logger.warn('Failed to pre-warm cache for key', { 
          key,
          error: (error as Error).message 
        });
      }
    });

    await Promise.allSettled(promises);
  }
};

// React hook for cached API calls
export function useCachedApi<T>(
  cacheKey: string | null,
  apiCall: () => Promise<T>,
  options: {
    ttl?: number;
    dependencies?: any[];
    enabled?: boolean;
  } = {}
): {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
} {
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const {
    ttl = 5 * 60 * 1000,
    dependencies = [],
    enabled = true
  } = options;

  const refetch = React.useCallback(async () => {
    if (!cacheKey || !enabled) return;

    setLoading(true);
    setError(null);

    try {
      const result = await CacheUtils.cachedApiCall(cacheKey, apiCall, ttl);
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [cacheKey, apiCall, ttl, enabled]);

  React.useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refetch, ...dependencies]);

  return { data, loading, error, refetch };
}

// Browser storage cache (localStorage/sessionStorage)
export class StorageCache {
  private storage: Storage;
  private prefix: string;

  constructor(storage: 'localStorage' | 'sessionStorage' = 'localStorage', prefix = 'cache:') {
    this.storage = typeof window !== 'undefined' ? window[storage] : ({} as Storage);
    this.prefix = prefix;
  }

  set(key: string, data: any, ttl: number = 60 * 60 * 1000): void {
    const entry = {
      data,
      timestamp: Date.now(),
      ttl
    };

    try {
      this.storage.setItem(this.prefix + key, JSON.stringify(entry));
    } catch (error) {
      // Storage quota exceeded or not available
      logger.warn('Storage cache failed to set item', error as Error);
    }
  }

  get<T = any>(key: string): T | null {
    try {
      const item = this.storage.getItem(this.prefix + key);
      if (!item) return null;

      const entry = JSON.parse(item);
      
      if (Date.now() - entry.timestamp > entry.ttl) {
        this.storage.removeItem(this.prefix + key);
        return null;
      }

      return entry.data;
    } catch (error) {
      // Invalid JSON or storage error
      this.storage.removeItem(this.prefix + key);
      return null;
    }
  }

  delete(key: string): void {
    this.storage.removeItem(this.prefix + key);
  }

  clear(): void {
    const keys = Object.keys(this.storage);
    keys.forEach(key => {
      if (key.startsWith(this.prefix)) {
        this.storage.removeItem(key);
      }
    });
  }
}

export const localStorageCache = new StorageCache('localStorage');
export const sessionStorageCache = new StorageCache('sessionStorage');

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    apiCache.destroy();
    userCache.destroy();
    staticDataCache.destroy();
  });
}