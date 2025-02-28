import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe, allowedEvents } from '@/lib/stripe';
import { processStripeEvent } from '@/lib/services/stripe-service';

/**
 * Webhook handler for Stripe events
 * This is called by Stripe when events occur in their system
 */
export async function POST(req: Request) {
  try {
    // Get request body and Stripe signature header
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get('Stripe-Signature');
    
    if (!signature) {
      return NextResponse.json(
        { error: 'Missing Stripe signature' },
        { status: 400 }
      );
    }
    
    // Verify webhook signature and construct event
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET || ''
      );
    } catch (err) {
      console.error('Error verifying webhook signature:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }
    
    // Only process events we care about
    if (!allowedEvents.includes(event.type as any)) {
      return NextResponse.json({ received: true });
    }
    
    // Process the event asynchronously - don't await here
    // This follows Stripe's best practice of responding quickly to webhooks
    // and handling processing asynchronously
    processStripeEvent(event).catch((error) => {
      console.error(`Error processing Stripe webhook (${event.type}):`, error);
    });
    
    // Return 200 OK immediately
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error in Stripe webhook handler:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 