import Stripe from 'stripe';
import { stripe as stripeEnv, isProd } from './env';

// Initialize Stripe with the appropriate secret key
export const stripe = new Stripe(
  stripeEnv.getSecretKey(),
  {
    apiVersion: '2025-02-24.acacia', // Use the latest API version
    typescript: true,
  }
);

// Get the publishable key for client-side usage
export const stripePublishableKey = stripeEnv.getPublishableKey();

// Allowed event types for webhook processing
export const allowedEvents: Stripe.Event.Type[] = [
  "checkout.session.completed",
  "payment_intent.succeeded",
  "payment_intent.payment_failed",
  "payment_intent.canceled",
];

// Export isProd from the env file for convenience
export { isProd } from './env';

/**
 * Type for storing payment information from Stripe in Redis
 */
export type STRIPE_PAYMENT_CACHE = 
  | {
      paymentIntentId: string;
      status: 'succeeded' | 'processing' | 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'canceled' | 'requires_capture' | string;
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
      status: "none" | string;
    }; 