import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { StripeEvent, allowedStripeEvents, handleStripeEvent } from '@/lib/stripe-webhooks';
import { kv } from '@/lib/kv-store';
import { stripe as stripeEnv } from '@/lib/env';

// Constants for Redis
const WEBHOOK_PROCESSED_PREFIX = 'stripe:webhook:processed:';
const WEBHOOK_TTL = 60 * 60 * 24; // 24 hours in seconds

/**
 * Webhook handler for Stripe events
 * This is called by Stripe when events occur in their system
 */
export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature') as string;

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      stripeEnv.webhookSecret
    ) as StripeEvent;
    
    // Check for event duplication using Redis
    const eventId = event.id;
    const redisKey = `${WEBHOOK_PROCESSED_PREFIX}${eventId}`;
    
    const isProcessed = await kv.get(redisKey);
    if (isProcessed) {
      console.log(`Webhook event ${eventId} already processed, skipping`);
      return NextResponse.json({ success: true, status: 'duplicate' });
    }
    
    // For allowed events, process them asynchronously
    if (allowedStripeEvents.includes(event.type)) {
      // Mark event as being processed in Redis
      await kv.set(redisKey, { timestamp: Date.now() }, WEBHOOK_TTL);
      
      // Handle the event
      try {
        await handleStripeEvent(event);
        console.log(`Webhook event ${eventId} processed successfully`);
      } catch (error) {
        console.error(`Error processing webhook event ${eventId}:`, error);
        // We don't delete the Redis key here, so we won't retry failed events
        // If you want to implement retries, you'd need additional logic
      }
    } else {
      console.log(`Ignoring webhook event ${event.type}`);
    }
    
    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Error verifying webhook signature:', err);
    
    if (err.type === 'StripeSignatureVerificationError') {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 