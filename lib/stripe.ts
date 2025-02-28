import Stripe from 'stripe';

// Initialize Stripe with the appropriate secret key
export const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY || '',
  {
    apiVersion: '2025-02-24.acacia', // Use the latest API version
    typescript: true,
  }
);

// Allowed event types for webhook processing
export const allowedEvents: Stripe.Event.Type[] = [
  "checkout.session.completed",
  "payment_intent.succeeded",
  "payment_intent.payment_failed",
  "payment_intent.canceled",
];

// Check if we're in a production environment
export const isProd = process.env.NODE_ENV === 'production';

/**
 * Type for storing payment information from Stripe in KV store
 */
export type STRIPE_PAYMENT_CACHE = 
  | {
      paymentIntentId: string;
      status: 'succeeded' | 'processing' | 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'canceled';
      amount: number;
      currency: string;
      paymentMethod?: {
        brand: string | null; // e.g., "visa", "mastercard"
        last4: string | null; // e.g., "4242"
      } | null;
      metadata: Record<string, string>;
      createdAt: number;
    } 
  | {
      status: "none";
    }; 