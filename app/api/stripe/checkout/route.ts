import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOrCreateStripeCustomer, createCheckoutSession } from '@/lib/services/stripe-service';
import { AppError, handleApiError } from '@/lib/utils/error-handler';
import { CartItem } from '@/lib/types/store';

/**
 * Generate a Stripe checkout session for the user's cart
 */
export async function POST(req: Request) {
  try {
    // Get the authenticated user
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Parse request body
    const { cartItems, minecraftUsername, returnUrl = '/store/checkout/success' }: {
      cartItems: CartItem[];
      minecraftUsername: string;
      returnUrl?: string;
    } = await req.json();
    
    // Validate request
    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty' },
        { status: 400 }
      );
    }
    
    if (!minecraftUsername) {
      return NextResponse.json(
        { error: 'Minecraft username is required' },
        { status: 400 }
      );
    }
    
    // Get or create Stripe customer
    const customerId = await getOrCreateStripeCustomer(
      session.user.id,
      session.user.email || ''
    );
    
    // Format items for checkout
    const items = cartItems.map(cartItem => ({
      id: cartItem.item.id,
      name: cartItem.item.name,
      price: cartItem.item.sale_price ?? cartItem.item.price,
      quantity: cartItem.quantity,
    }));
    
    // Create checkout session
    const checkoutSession = await createCheckoutSession({
      customerId,
      items,
      minecraftUsername,
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL}${returnUrl}`,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/store/cart`,
    });
    
    // Return the checkout URL
    return NextResponse.json({ checkoutUrl: checkoutSession.url });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }
    
    return handleApiError(error, 'Failed to create checkout session');
  }
} 