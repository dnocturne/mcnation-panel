import { stripe, STRIPE_PAYMENT_CACHE } from '@/lib/stripe';
import { AppError } from '@/lib/utils/error-handler';
import Stripe from 'stripe';
import {
  cacheCustomerId,
  getCachedCustomerId,
  cachePaymentData,
  cacheCheckoutSession,
  getCachedCheckoutSession,
  markWebhookAsProcessed,
  hasWebhookBeenProcessed,
  cachePaymentIntent
} from '@/lib/stripe-cache';

/**
 * Get or create a Stripe customer for a user
 */
export async function getOrCreateStripeCustomer(userId: string, email: string): Promise<string> {
  // Try to get existing customer ID from Redis
  let customerId = await getCachedCustomerId(userId);
  
  if (!customerId) {
    try {
      // Create a new customer
      const customer = await stripe.customers.create({
        email,
        metadata: {
          userId, // Store userId in customer metadata for future reference
        },
      });
      
      // Store the customer ID in Redis
      await cacheCustomerId(userId, customer.id);
      customerId = customer.id;
    } catch (error) {
      console.error('Error creating Stripe customer:', error);
      throw new AppError('Failed to create Stripe customer', 'STRIPE_ERROR');
    }
  }
  
  return customerId;
}

/**
 * Create a checkout session for a one-time payment
 */
export async function createCheckoutSession({
  customerId,
  items,
  successUrl,
  cancelUrl,
  minecraftUsername,
}: {
  customerId: string;
  items: { price: number; name: string; id: number; quantity: number }[];
  successUrl: string;
  cancelUrl: string;
  minecraftUsername: string;
}) {
  try {
    // Validate items before creating line items
    if (!items || items.length === 0) {
      throw new AppError('No items provided for checkout', 'INVALID_INPUT');
    }
    
    // Filter out items with invalid prices and ensure minimum pricing
    const validItems = items.filter(item => {
      if (isNaN(item.price) || item.price <= 0) {
        console.warn(`Skipping item with invalid price: ${item.id}, ${item.name}, ${item.price}`);
        return false;
      }
      return true;
    });
    
    if (validItems.length === 0) {
      throw new AppError('No valid items with prices found', 'INVALID_INPUT');
    }
    
    // Create line items for Stripe checkout
    const lineItems = validItems.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          metadata: {
            itemId: String(item.id),
          },
        },
        unit_amount: Math.round(item.price * 100), // Convert to cents
      },
      quantity: item.quantity,
    }));
    
    // Create the checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment', // one-time payment
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId: customerId.split('_')[1], // Extract user ID from customer ID
        minecraftUsername,
        itemIds: validItems.map(item => item.id).join(','),
      },
    });
    
    // Cache the session data
    await cacheCheckoutSession(session.id, {
      id: session.id,
      status: session.status,
      customerId: session.customer,
      metadata: session.metadata,
      created: session.created,
    });
    
    return session;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw new AppError('Failed to create checkout session', 'STRIPE_ERROR');
  }
}

/**
 * Get a Stripe customer by ID
 */
export async function getCustomerById(customerId: string): Promise<Stripe.Customer | null> {
  try {
    const customer = await stripe.customers.retrieve(customerId);
    // Return null if the customer is deleted
    if (customer.deleted) {
      return null;
    }
    return customer as Stripe.Customer;
  } catch (error) {
    console.error(`Error retrieving customer ${customerId}:`, error);
    return null;
  }
}

/**
 * Sync Stripe data to Redis
 */
export async function syncStripeDataToRedis(): Promise<void> {
  try {
    console.log('Syncing Stripe data to Redis...');
    
    // Get all payment intents from Stripe
    const paymentIntents = await stripe.paymentIntents.list({
      limit: 100,
    });
    
    // Process payment intents and cache them in Redis
    for (const intent of paymentIntents.data) {
      // Create a payment object that matches the STRIPE_PAYMENT_CACHE type
      const payment: STRIPE_PAYMENT_CACHE = {
        paymentIntentId: intent.id,
        status: intent.status as any, // Type casting as the status matches our enum
        amount: intent.amount,
        currency: intent.currency,
        metadata: intent.metadata as Record<string, string>,
        createdAt: intent.created,
      };
      
      // Try to get payment method details if available
      if (intent.payment_method && typeof intent.payment_method === 'string') {
        try {
          const paymentMethod = await stripe.paymentMethods.retrieve(intent.payment_method);
          if (paymentMethod.type === 'card' && paymentMethod.card) {
            payment.paymentMethod = {
              brand: paymentMethod.card.brand,
              last4: paymentMethod.card.last4,
            };
          }
        } catch (error) {
          console.error(`Error retrieving payment method for ${intent.id}:`, error);
        }
      }
      
      // Cache payment in Redis by payment intent ID
      await cachePaymentIntent(intent.id, payment);
      
      // If there's a customer, also cache by customer ID
      if (intent.customer && typeof intent.customer === 'string') {
        await cachePaymentData(intent.customer, payment);
      }
    }
    
    console.log(`Synced ${paymentIntents.data.length} payments to Redis`);
  } catch (error) {
    console.error('Error syncing Stripe data to Redis:', error);
    throw error;
  }
}

/**
 * Sync payment data for a customer to Redis
 * This is the central function for maintaining consistency between Stripe and your app
 */
export async function syncStripeDataToKV(customerId: string): Promise<STRIPE_PAYMENT_CACHE> {
  try {
    // Fetch the most recent payment intent for the customer
    const paymentIntents = await stripe.paymentIntents.list({
      customer: customerId,
      limit: 5, // Get the 5 most recent payment intents
    });
    
    if (paymentIntents.data.length === 0) {
      const paymentData: STRIPE_PAYMENT_CACHE = { status: "none" };
      await cachePaymentData(customerId, paymentData);
      return paymentData;
    }
    
    // Find the most recent successful payment
    const successfulPayment = paymentIntents.data.find(pi => pi.status === 'succeeded');
    
    if (!successfulPayment) {
      // If no successful payment, just store the latest payment intent info
      const latestPayment = paymentIntents.data[0];
      const paymentData: STRIPE_PAYMENT_CACHE = {
        paymentIntentId: latestPayment.id,
        status: latestPayment.status as any,
        amount: latestPayment.amount,
        currency: latestPayment.currency,
        metadata: latestPayment.metadata as Record<string, string>,
        createdAt: latestPayment.created,
      };
      
      await cachePaymentData(customerId, paymentData);
      await cachePaymentIntent(latestPayment.id, paymentData);
      return paymentData;
    }
    
    // Get payment method details if available
    let paymentMethod = null;
    if (successfulPayment.payment_method) {
      try {
        const paymentMethodDetails = await stripe.paymentMethods.retrieve(
          successfulPayment.payment_method as string
        );
        
        if (paymentMethodDetails.type === 'card' && paymentMethodDetails.card) {
          paymentMethod = {
            brand: paymentMethodDetails.card.brand,
            last4: paymentMethodDetails.card.last4,
          };
        }
      } catch (error) {
        console.error('Error retrieving payment method:', error);
      }
    }
    
    // Store payment data
    const paymentData: STRIPE_PAYMENT_CACHE = {
      paymentIntentId: successfulPayment.id,
      status: successfulPayment.status as any,
      amount: successfulPayment.amount,
      currency: successfulPayment.currency,
      paymentMethod,
      metadata: successfulPayment.metadata as Record<string, string>,
      createdAt: successfulPayment.created,
    };
    
    await cachePaymentData(customerId, paymentData);
    await cachePaymentIntent(successfulPayment.id, paymentData);
    return paymentData;
  } catch (error) {
    console.error('Error syncing Stripe data:', error);
    throw new AppError('Failed to sync Stripe data', 'STRIPE_ERROR');
  }
}

/**
 * Process a Stripe webhook event
 */
export async function processStripeEvent(event: any) {
  const { type, id } = event;
  const { object } = event.data;
  
  // Prevent duplicate processing of webhook events
  const isProcessed = await hasWebhookBeenProcessed(id);
  if (isProcessed) {
    console.log(`Webhook ${id} has already been processed, skipping`);
    return;
  }
  
  switch (type) {
    case 'checkout.session.completed': {
      const session = object;
      if (session.customer) {
        // Sync customer data after checkout completes
        await syncStripeDataToKV(session.customer);
      }
      break;
    }
    
    case 'payment_intent.succeeded': {
      const paymentIntent = object;
      if (paymentIntent.customer) {
        // Sync customer data after payment succeeds
        await syncStripeDataToKV(paymentIntent.customer);
      }
      break;
    }
    
    case 'payment_intent.payment_failed':
    case 'payment_intent.canceled': {
      const paymentIntent = object;
      if (paymentIntent.customer) {
        // Sync customer data after payment fails or is canceled
        await syncStripeDataToKV(paymentIntent.customer);
      }
      break;
    }
    
    default:
      console.log(`Unhandled event type: ${type}`);
  }
  
  // Mark webhook as processed
  await markWebhookAsProcessed(id);
} 