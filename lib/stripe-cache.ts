import { kv } from './kv-store';
import { STRIPE_PAYMENT_CACHE } from './stripe';
import Stripe from 'stripe';

// Cache TTL values (in seconds)
const CACHE_TTL = {
  CUSTOMER_ID: 30 * 24 * 60 * 60,  // 30 days
  PAYMENT_DATA: 24 * 60 * 60,       // 24 hours
  CHECKOUT_SESSION: 60 * 60,        // 1 hour
  WEBHOOK_EVENT: 24 * 60 * 60,      // 24 hours
};

// Prefix keys for better organization
const PREFIX = {
  CUSTOMER: 'stripe:customer:',
  USER: 'stripe:user:',
  PAYMENT: 'stripe:payment:',
  SESSION: 'stripe:session:',
  WEBHOOK: 'stripe:webhook:',
};

/**
 * Cache the customer ID for a user
 */
export async function cacheCustomerId(userId: string, customerId: string): Promise<void> {
  await kv.set(`${PREFIX.USER}${userId}`, customerId, CACHE_TTL.CUSTOMER_ID);
}

/**
 * Get a cached customer ID for a user
 */
export async function getCachedCustomerId(userId: string): Promise<string | null> {
  return kv.get<string>(`${PREFIX.USER}${userId}`);
}

/**
 * Cache payment data for a customer
 */
export async function cachePaymentData(customerId: string, data: STRIPE_PAYMENT_CACHE): Promise<void> {
  await kv.set(`${PREFIX.CUSTOMER}${customerId}`, data, CACHE_TTL.PAYMENT_DATA);
}

/**
 * Get cached payment data for a customer
 */
export async function getCachedPaymentData(customerId: string): Promise<STRIPE_PAYMENT_CACHE | null> {
  return kv.get<STRIPE_PAYMENT_CACHE>(`${PREFIX.CUSTOMER}${customerId}`);
}

/**
 * Cache a checkout session
 */
export async function cacheCheckoutSession(sessionId: string, sessionData: any): Promise<void> {
  await kv.set(`${PREFIX.SESSION}${sessionId}`, sessionData, CACHE_TTL.CHECKOUT_SESSION);
}

/**
 * Get a cached checkout session
 */
export async function getCachedCheckoutSession(sessionId: string): Promise<any | null> {
  return kv.get(`${PREFIX.SESSION}${sessionId}`);
}

/**
 * Cache that a webhook event has been processed to prevent duplicate processing
 */
export async function markWebhookAsProcessed(webhookId: string): Promise<void> {
  await kv.set(`${PREFIX.WEBHOOK}${webhookId}`, true, CACHE_TTL.WEBHOOK_EVENT);
}

/**
 * Check if a webhook event has already been processed
 */
export async function hasWebhookBeenProcessed(webhookId: string): Promise<boolean> {
  const processed = await kv.get<boolean>(`${PREFIX.WEBHOOK}${webhookId}`);
  return processed === true;
}

/**
 * Store a payment intent with its metadata
 */
export async function cachePaymentIntent(paymentIntentId: string, data: any): Promise<void> {
  await kv.set(`${PREFIX.PAYMENT}${paymentIntentId}`, data, CACHE_TTL.PAYMENT_DATA);
}

/**
 * Get a cached payment intent
 */
export async function getCachedPaymentIntent(paymentIntentId: string): Promise<any | null> {
  return kv.get(`${PREFIX.PAYMENT}${paymentIntentId}`);
}

/**
 * Delete a cached payment intent
 */
export async function deleteCachedPaymentIntent(paymentIntentId: string): Promise<void> {
  await kv.delete(`${PREFIX.PAYMENT}${paymentIntentId}`);
}

/**
 * Cache payment data directly with the payment ID
 * This is used by the webhook handlers to store payment data
 */
export async function cachePayment(paymentId: string, data: any): Promise<void> {
  await kv.set(`${PREFIX.PAYMENT}${paymentId}`, data, CACHE_TTL.PAYMENT_DATA);
}

/**
 * Get cached payment data by payment ID
 */
export async function getCachedPayment(paymentId: string): Promise<any | null> {
  return kv.get(`${PREFIX.PAYMENT}${paymentId}`);
} 