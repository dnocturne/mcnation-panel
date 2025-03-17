import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
	getOrCreateStripeCustomer,
	createCheckoutSession,
} from "@/lib/services/stripe-service";
import { getCachedCustomerId } from "@/lib/stripe-cache";

// Type for cart items
interface CartItem {
	id: number;
	name: string;
	price: number;
	quantity: number;
}

// Type for request body
interface CheckoutRequest {
	cartItems: CartItem[];
	minecraftUsername: string;
	returnUrl?: string;
}

/**
 * Generate a Stripe checkout session for the user's cart
 */
export async function POST(req: Request) {
	try {
		// Check if the user is authenticated
		const session = await getServerSession(authOptions);
		if (!session?.user) {
			return NextResponse.json(
				{ error: "Unauthorized. Please log in." },
				{ status: 401 },
			);
		}

		// Parse the request body
		const body = (await req.json()) as CheckoutRequest;
		const { cartItems, minecraftUsername = "/store/checkout/success" } = body;

		// Validate request
		if (!cartItems || !cartItems.length) {
			return NextResponse.json(
				{ error: "Your cart is empty." },
				{ status: 400 },
			);
		}

		if (!minecraftUsername) {
			return NextResponse.json(
				{ error: "Minecraft username is required." },
				{ status: 400 },
			);
		}

		// Get user info
		const user = session.user;
		const email = user.email || "";
		const userId = user.id;

		// Check for existing customer ID in Redis first
		let customerId = await getCachedCustomerId(userId);

		// If not found in Redis, create or retrieve the customer
		if (!customerId) {
			customerId = await getOrCreateStripeCustomer(userId, email);
		}

		// Create checkout session with success and cancel URLs
		const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
		const checkoutSession = await createCheckoutSession({
			customerId,
			items: cartItems,
			successUrl: `${baseUrl}/store/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
			cancelUrl: `${baseUrl}/store/cart?cancelled=true`,
			minecraftUsername,
		});

		// Return the checkout URL to the client
		return NextResponse.json({ checkoutUrl: checkoutSession.url });
	} catch (error: unknown) {
		console.error("Checkout API error:", error);

		const errorMessage =
			error instanceof Error ? error.message : "An unexpected error occurred";
		const statusCode = (error as { statusCode?: number })?.statusCode || 500;

		return NextResponse.json({ error: errorMessage }, { status: statusCode });
	}
}
