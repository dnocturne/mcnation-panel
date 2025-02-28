import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { stripe } from '@/lib/stripe';
import { handleApiError } from '@/lib/utils/error-handler';

/**
 * API route to fetch Stripe payment data
 */
export async function GET(req: Request) {
  try {
    // Verify admin authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // Get query parameters
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const status = url.searchParams.get('status');
    
    // Fetch payment intents from Stripe
    const paymentIntents = await stripe.paymentIntents.list({
      limit: Math.min(limit, 100), // Cap at 100 for performance
      ...(status ? { status } : {}),
      expand: ['data.customer', 'data.payment_method'],
    });
    
    // Transform data to a more usable format
    const payments = await Promise.all(
      paymentIntents.data.map(async (intent) => {
        // Attempt to get customer email
        let customerEmail = 'Unknown';
        let minecraftUsername = 'Unknown';
        
        if (intent.customer && typeof intent.customer !== 'string') {
          // Check if the customer is not deleted and has an email property
          if ('email' in intent.customer && intent.customer.email) {
            customerEmail = intent.customer.email;
          }
          
          // Try to get minecraft username from metadata
          if (intent.metadata && intent.metadata.minecraftUsername) {
            minecraftUsername = intent.metadata.minecraftUsername;
          }
        }
        
        // Get payment method details
        let paymentMethod = null;
        if (intent.payment_method && typeof intent.payment_method !== 'string') {
          if (intent.payment_method.type === 'card' && intent.payment_method.card) {
            paymentMethod = {
              brand: intent.payment_method.card.brand,
              last4: intent.payment_method.card.last4,
            };
          }
        }
        
        return {
          id: intent.id,
          amount: intent.amount,
          currency: intent.currency,
          status: intent.status,
          customerEmail,
          minecraftUsername,
          created: new Date(intent.created * 1000).toISOString(),
          paymentMethod,
        };
      })
    );
    
    return NextResponse.json(payments);
  } catch (error) {
    console.error('Error fetching payment data:', error);
    return handleApiError(error, 'Failed to fetch payment data');
  }
} 