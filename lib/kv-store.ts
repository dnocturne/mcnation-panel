/**
 * Simple key-value store for Stripe data
 * In production, you would replace this with a proper KV store like Redis/Upstash
 */

// In-memory storage
const store: Map<string, string> = new Map();

// KV store duration in seconds (default: 24 hours)
const DEFAULT_TTL = 24 * 60 * 60;

/**
 * Key-value store for server-side data storage
 */
export const kv = {
  /**
   * Get a value from the KV store
   */
  get: async <T>(key: string): Promise<T | null> => {
    const data = store.get(key);
    if (!data) return null;
    
    try {
      const { value, expires } = JSON.parse(data);
      
      // Check if the data has expired
      if (expires && Date.now() > expires) {
        await kv.delete(key);
        return null;
      }
      
      return value as T;
    } catch (error) {
      console.error(`Error parsing KV data for key ${key}:`, error);
      return null;
    }
  },
  
  /**
   * Set a value in the KV store with optional TTL
   */
  set: async <T>(key: string, value: T, ttlSeconds = DEFAULT_TTL): Promise<void> => {
    const expires = ttlSeconds > 0 ? Date.now() + ttlSeconds * 1000 : null;
    const data = JSON.stringify({ value, expires });
    store.set(key, data);
  },
  
  /**
   * Delete a value from the KV store
   */
  delete: async (key: string): Promise<void> => {
    store.delete(key);
  },
  
  /**
   * Check if a key exists in the KV store
   */
  exists: async (key: string): Promise<boolean> => {
    return store.has(key);
  }
};

// In production, you would replace this with a real KV implementation:
// 
// For Redis/Upstash:
// import { Redis } from '@upstash/redis'
// export const kv = Redis.fromEnv()
//
// For Vercel KV:
// import { kv } from '@vercel/kv'
// export { kv } 