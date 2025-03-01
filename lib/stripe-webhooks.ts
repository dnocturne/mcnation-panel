import { stripe, STRIPE_PAYMENT_CACHE } from './stripe';
import { syncStripeDataToRedis } from './services/stripe-service';
import { processCheckoutCompletion } from './services/checkout-service';
import Stripe from 'stripe';

/**
 * Define the specific Stripe event types we handle
 * Only events in this list will be processed by our webhook handler
 */
export const allowedStripeEvents = [
  'payment_intent.succeeded',
  'payment_intent.payment_failed',
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.paid',
  'invoice.payment_failed',
] as const;

/**
 * Type for allowed Stripe event types
 * This creates a union type of all the allowed events
 */
export type StripeEventType = typeof allowedStripeEvents[number];

/**
 * Type for Stripe event objects we handle
 * This extends the base Stripe.Event type with our specific types
 */
export type StripeEvent = Omit<Stripe.Event, 'type'> & {
  type: StripeEventType;
  data: {
    object: Stripe.PaymentIntent | Stripe.Checkout.Session | Stripe.Subscription | Stripe.Invoice;
  };
};

/**
 * Handle a Stripe webhook event
 * This is the main entry point for processing Stripe events from webhooks
 * 
 * @param event The validated Stripe event to handle
 */
export async function handleStripeEvent(event: StripeEvent): Promise<void> {
  const { type, data } = event;
  
  console.log(`Processing Stripe webhook event: ${type}`);
  
  switch (type) {
    case 'payment_intent.succeeded':
      await handlePaymentIntentSucceeded(data.object as Stripe.PaymentIntent);
      break;
      
    case 'payment_intent.payment_failed':
      await handlePaymentIntentFailed(data.object as Stripe.PaymentIntent);
      break;
      
    case 'checkout.session.completed':
      await handleCheckoutSessionCompleted(data.object as Stripe.Checkout.Session);
      break;
      
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      await handleSubscriptionChange(type, data.object as Stripe.Subscription);
      break;
      
    case 'invoice.paid':
    case 'invoice.payment_failed':
      await handleInvoiceEvent(type, data.object as Stripe.Invoice);
      break;
      
    default:
      // TypeScript should prevent this case due to our StripeEventType
      // If we end up here, it means we've added an event to allowedStripeEvents
      // but haven't added a case to handle it
      console.warn(`Unhandled Stripe event type: ${type}`);
      
      // Use type narrowing with a type assertion to help TypeScript
      const _exhaustiveCheck: never = type;
      return _exhaustiveCheck;
  }
}

/**
 * Handle a successful payment intent
 * This is called when a payment succeeds
 * 
 * @param paymentIntent The payment intent object from Stripe
 */
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
  console.log(`Payment succeeded: ${paymentIntent.id}`);
  
  try {
    // Sync payment data to Redis
    await syncStripeDataToRedis();
    
    // If you need to do anything specific with this payment, do it here
    // For example: update user permissions, send confirmation emails, etc.
  } catch (error) {
    console.error('Error handling payment intent success:', error);
    throw error;
  }
}

/**
 * Handle a failed payment intent
 * This is called when a payment fails
 * 
 * @param paymentIntent The payment intent object from Stripe
 */
async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
  console.log(`Payment failed: ${paymentIntent.id}, reason: ${paymentIntent.last_payment_error?.message || 'unknown'}`);
  
  try {
    // Sync payment data to Redis
    await syncStripeDataToRedis();
    
    // You might want to notify the user about the failed payment
    // Or take other actions based on the payment failure
  } catch (error) {
    console.error('Error handling payment intent failure:', error);
    throw error;
  }
}

/**
 * Handle a completed checkout session
 * This is called when a checkout session completes (customer finishes checkout)
 * 
 * @param session The checkout session object from Stripe
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session): Promise<void> {
  console.log(`Checkout session completed: ${session.id}`);
  
  try {
    // Make sure we have the latest payment data in our cache
    await syncStripeDataToRedis();
    
    // Process the checkout and grant items to the player
    await processCheckoutCompletion(session.id);
  } catch (error) {
    console.error('Error handling checkout session completion:', error);
    throw error;
  }
}

/**
 * Handle subscription changes
 * This is called when a subscription is created, updated, or deleted
 * 
 * @param eventType The specific event type
 * @param subscription The subscription object from Stripe
 */
async function handleSubscriptionChange(
  eventType: StripeEventType,
  subscription: Stripe.Subscription
): Promise<void> {
  console.log(`Subscription ${eventType.split('.')[2]}: ${subscription.id}`);
  
  try {
    // Update subscription data in Redis
    await syncStripeDataToRedis();
    
    // Handle specific subscription states
    // You might want to update user permissions, send emails, etc.
  } catch (error) {
    console.error(`Error handling subscription ${eventType}:`, error);
    throw error;
  }
}

/**
 * Handle invoice events
 * This is called when an invoice is paid or payment fails
 * 
 * @param eventType The specific event type
 * @param invoice The invoice object from Stripe
 */
async function handleInvoiceEvent(
  eventType: StripeEventType,
  invoice: Stripe.Invoice
): Promise<void> {
  const status = eventType === 'invoice.paid' ? 'paid' : 'failed';
  console.log(`Invoice ${status}: ${invoice.id}`);
  
  try {
    // Update payment data in Redis
    await syncStripeDataToRedis();
    
    // Handle specific invoice statuses
    // You might want to update user permissions, send emails, etc.
  } catch (error) {
    console.error(`Error handling invoice ${eventType}:`, error);
    throw error;
  }
} 