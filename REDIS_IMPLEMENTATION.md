# Stripe + Redis Implementation for MCNation Panel

This document explains the Redis and Stripe implementation for the MCNation Panel, following best practices recommended by Theo from t3.gg.

## Overview

We've implemented a robust Stripe payment system with Upstash Redis for the following features:

1. **Customer ID caching**: Caching Stripe customer IDs to reduce Stripe API calls
2. **Payment data caching**: Storing payment data for faster access 
3. **Checkout session caching**: Temporarily storing checkout session information
4. **Webhook deduplication**: Preventing duplicate processing of Stripe webhook events
5. **Eager data syncing**: Syncing data immediately after checkout to prevent race conditions

## Implementation Philosophy

This implementation follows Theo's "How I Stay Sane Implementing Stripe" philosophy:

1. **Single source of truth**: Redis serves as the central data store for Stripe payment state
2. **Preventing split brain issues**: Using a single `syncStripeDataToRedis()` function to sync all data
3. **Eager syncing**: Syncing data immediately after checkout completion before webhooks arrive
4. **Type safety**: Strong TypeScript types throughout the implementation
5. **Environment variable validation**: Proper validation and management of API keys

## Testing the Redis Connection

We've created a test file to verify the Redis connection and basic operations. Run the test with:

```bash
bun lib/tests/test-redis.ts
```

This test will:
1. Connect to Redis
2. Set a test value
3. Read the test value
4. Test the stripe-cache functions
5. Clean up test data

## Key Files

1. **`lib/env.ts`**: Environment variable manager with validation for Stripe API keys
2. **`lib/kv-store.ts`**: Type-safe Redis implementation using Upstash
3. **`lib/stripe.ts`**: Stripe initialization and type definitions
4. **`lib/stripe-cache.ts`**: Redis caching functions for Stripe data
5. **`lib/stripe-webhooks.ts`**: Type-safe webhook event handlers
6. **`lib/services/stripe-service.ts`**: Core Stripe business logic with Redis integration
7. **`app/api/webhooks/stripe/route.ts`**: Webhook handler with deduplication
8. **`app/api/stripe/checkout/route.ts`**: Checkout API with customer ID caching
9. **`app/store/checkout/success/route.ts`**: Success page handler for eager data syncing

## Checkout Flow

The checkout flow follows these steps:

1. **User clicks "Buy"** in the store UI
2. **Frontend calls checkout API** - `POST /api/stripe/checkout`
3. **Backend creates/retrieves Stripe customer** - Using Redis first, then Stripe API if needed
4. **Backend creates checkout session** - With success URL pointing to our success route
5. **User completes payment on Stripe checkout page**
6. **User redirected to success page** - `/store/checkout/success?session_id=...`
7. **Success page handler eagerly syncs data** - Calls `syncStripeDataToRedis()`
8. **User sees thank you page** - With their purchase details
9. **Webhook eventually processes event** - Providing a backup sync mechanism

## Usage in Code

### Checking for a cached customer ID:

```typescript
import { getCachedCustomerId } from '@/lib/stripe-cache';

// Check Redis first before making a Stripe API call
const customerId = await getCachedCustomerId(userId);
if (customerId) {
  // Use cached customer ID
} else {
  // Create new customer or fetch from Stripe
}
```

### Syncing Stripe data to Redis:

```typescript
import { syncStripeDataToRedis } from '@/lib/services/stripe-service';

// Sync all payment data to Redis
await syncStripeDataToRedis();
```

### Webhook deduplication:

The webhook handler automatically checks if an event has been processed:

```typescript
// From app/api/webhooks/stripe/route.ts
const isProcessed = await kv.get(redisKey);
if (isProcessed) {
  console.log(`Webhook event ${eventId} already processed, skipping`);
  return NextResponse.json({ success: true, status: 'duplicate' });
}
```

## Environment Variables

All required environment variables are documented in the `.env.example` file. Copy this file to `.env.local` and fill in your values:

```
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
UPSTASH_REDIS_REST_URL=https://your-instance.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token-here
```

## Monitoring Redis Usage

You can monitor Redis usage in the Upstash dashboard at https://console.upstash.com/

Key metrics to monitor:
- Command usage
- Database size
- Connection count
- Cache hit rate

## Benefits of This Implementation

1. **Improved Reliability**: Prevents race conditions and split brain issues
2. **Better Performance**: Reduces Stripe API calls with Redis caching
3. **Type Safety**: Strong TypeScript types throughout the codebase
4. **Webhook Deduplication**: Prevents duplicate processing of events
5. **Environment Validation**: Proper validation of API keys and environment variables

## Next Steps

1. Consider implementing Redis for session storage
2. Add monitoring for Redis cache hit rates
3. Implement analytics for payment tracking 