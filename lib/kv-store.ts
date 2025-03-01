/**
 * Redis-based key-value store for Stripe data using Upstash
 */

import { Redis } from '@upstash/redis'
import { redis as redisEnv } from './env'

// KV store duration in seconds (default: 24 hours)
const DEFAULT_TTL = 24 * 60 * 60;

// Initialize Redis client with Upstash credentials from environment variables
const redis = new Redis({
  url: redisEnv.url,
  token: redisEnv.token,
})

/**
 * Type-safe key-value store for server-side data storage
 */
export const kv = {
  /**
   * Get a value from the KV store with strong typing
   * @param key The key to retrieve
   * @returns The stored value or null if not found
   */
  get: async <T>(key: string): Promise<T | null> => {
    try {
      const data = await redis.get(key) as T;
      return data || null;
    } catch (error) {
      console.error(`Error retrieving data for key ${key}:`, error);
      return null;
    }
  },
  
  /**
   * Set a value in the KV store with optional TTL
   * @param key The key to store
   * @param value The value to store
   * @param ttlSeconds Time-to-live in seconds (default: 24 hours)
   */
  set: async <T>(key: string, value: T, ttlSeconds = DEFAULT_TTL): Promise<void> => {
    try {
      if (ttlSeconds > 0) {
        await redis.set(key, value, { ex: ttlSeconds });
      } else {
        await redis.set(key, value);
      }
    } catch (error) {
      console.error(`Error setting data for key ${key}:`, error);
    }
  },
  
  /**
   * Delete a value from the KV store
   * @param key The key to delete
   */
  delete: async (key: string): Promise<void> => {
    try {
      await redis.del(key);
    } catch (error) {
      console.error(`Error deleting data for key ${key}:`, error);
    }
  },
  
  /**
   * Check if a key exists in the KV store
   * @param key The key to check
   * @returns True if the key exists, false otherwise
   */
  exists: async (key: string): Promise<boolean> => {
    try {
      return await redis.exists(key) === 1;
    } catch (error) {
      console.error(`Error checking existence for key ${key}:`, error);
      return false;
    }
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