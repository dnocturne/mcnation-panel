import { stripe, STRIPE_PAYMENT_CACHE } from '@/lib/stripe';
import { kv } from '@/lib/kv-store';
import { AppError } from '@/lib/utils/error-handler';

/**
 * Get or create a Stripe customer for a user
 */
export async function getOrCreateStripeCustomer(userId: string, email: string): Promise<string> {
  // Try to get existing customer ID from KV
  const customerIdKey = `stripe:user:${userId}`;
  let customerId = await kv.get<string>(customerIdKey);
  
  if (!customerId) {
    try {
      // Create a new customer
      const customer = await stripe.customers.create({
        email,
        metadata: {
          userId, // Store userId in customer metadata for future reference
        },
      });
      
      // Store the customer ID in KV
      await kv.set(customerIdKey, customer.id);
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
    // Create line items for Stripe checkout
    const lineItems = items.map(item => ({
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
        itemIds: items.map(item => item.id).join(','),
      },
    });
    
    return session;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw new AppError('Failed to create checkout session', 'STRIPE_ERROR');
  }
}

/**
 * Sync payment data for a customer to KV store
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
      const paymentData = { status: "none" };
      await kv.set(`stripe:customer:${customerId}`, paymentData);
      return paymentData;
    }
    
    // Find the most recent successful payment
    const successfulPayment = paymentIntents.data.find(pi => pi.status === 'succeeded');
    
    if (!successfulPayment) {
      // If no successful payment, just store the latest payment intent info
      const latestPayment = paymentIntents.data[0];
      const paymentData: STRIPE_PAYMENT_CACHE = {
        paymentIntentId: latestPayment.id,
        status: latestPayment.status,
        amount: latestPayment.amount,
        currency: latestPayment.currency,
        metadata: latestPayment.metadata as Record<string, string>,
        createdAt: latestPayment.created,
      };
      
      await kv.set(`stripe:customer:${customerId}`, paymentData);
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
      status: successfulPayment.status,
      amount: successfulPayment.amount,
      currency: successfulPayment.currency,
      paymentMethod,
      metadata: successfulPayment.metadata as Record<string, string>,
      createdAt: successfulPayment.created,
    };
    
    await kv.set(`stripe:customer:${customerId}`, paymentData);
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
  const { type } = event;
  const { object } = event.data;
  
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
} 