/**
 * Test file for Redis connection
 * Run with: bun lib/tests/test-redis.ts
 */

import { kv } from '../kv-store';
import { cacheCustomerId, getCachedCustomerId } from '../stripe-cache';

async function testRedisConnection() {
  console.log('Testing Redis connection...');
  
  try {
    // Test basic set/get operation
    const testKey = 'test:connection:' + Date.now();
    const testValue = { timestamp: Date.now(), message: 'Hello Redis!' };
    
    console.log(`Setting test value with key: ${testKey}`);
    await kv.set(testKey, testValue, 60); // 1 minute TTL
    
    console.log('Reading test value...');
    const retrievedValue = await kv.get(testKey);
    
    if (retrievedValue) {
      console.log('✅ Redis connection successful!');
      console.log('Retrieved value:', retrievedValue);
    } else {
      console.error('❌ Failed to retrieve value from Redis');
    }
    
    // Test stripe-cache functions
    const userId = 'test-user-' + Date.now();
    const customerId = 'cus_' + Math.random().toString(36).substring(2, 15);
    
    console.log(`Testing Stripe cache with userId: ${userId}, customerId: ${customerId}`);
    await cacheCustomerId(userId, customerId);
    
    const retrievedCustomerId = await getCachedCustomerId(userId);
    if (retrievedCustomerId === customerId) {
      console.log('✅ Stripe customer ID caching works!');
    } else {
      console.error('❌ Failed to retrieve customer ID from Redis');
      console.log('Expected:', customerId);
      console.log('Got:', retrievedCustomerId);
    }
    
    // Cleanup
    console.log('Cleaning up test keys...');
    await kv.delete(testKey);
    
    console.log('All tests completed!');
  } catch (error) {
    console.error('❌ Redis test failed with error:', error);
  }
}

// Run the test
testRedisConnection(); 