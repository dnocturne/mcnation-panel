import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getCachedCustomerId } from '@/lib/stripe-cache';
import { syncStripeDataToRedis } from '@/lib/services/stripe-service';
import { redirect } from 'next/navigation';

/**
 * Handler for the checkout success page
 * This is called when a user is redirected back from Stripe after a successful checkout
 * We eagerly sync Stripe data to prevent race conditions with webhooks
 */
export async function GET(req: NextRequest) {
  // Get user session
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    // If no user is logged in, redirect to login
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Get customer ID from Redis
  const userId = session.user.id;
  const customerId = await getCachedCustomerId(userId);
  
  if (!customerId) {
    console.error('No Stripe customer ID found for user', userId);
    // Redirect to homepage if no customer ID is found
    return NextResponse.redirect(new URL('/', req.url));
  }

  try {
    // Optional: Get the checkout session ID from the URL if you want to verify it
    const url = new URL(req.url);
    const sessionId = url.searchParams.get('session_id');
    
    if (sessionId) {
      console.log(`Checkout success for session ${sessionId}`);
    }

    // Eagerly sync latest Stripe data to Redis
    // This ensures the user sees their updated payment status immediately
    // without waiting for webhooks
    await syncStripeDataToRedis();
    
    console.log(`Successfully synced Stripe data for customer ${customerId}`);
    
    // Redirect to thank you page or order confirmation
    return NextResponse.redirect(new URL('/store/thank-you', req.url));
  } catch (error) {
    console.error('Error syncing Stripe data on checkout success:', error);
    // Even if sync fails, redirect user to a thank you page
    // The webhook will eventually sync the data
    return NextResponse.redirect(new URL('/store/thank-you?sync=failed', req.url));
  }
} 