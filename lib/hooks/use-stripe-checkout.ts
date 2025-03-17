import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

// Define the API's expected cart item format
export interface CheckoutCartItem {
	id: number;
	name: string;
	price: number;
	quantity: number;
}

interface UseStripeCheckoutOptions {
	redirectToCheckout?: boolean;
}

/**
 * Hook for handling Stripe checkout
 */
export function useStripeCheckout(options: UseStripeCheckoutOptions = {}) {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const { toast } = useToast();

	// Default option values
	const { redirectToCheckout = true } = options;

	const createCheckoutSession = async ({
		cartItems,
		minecraftUsername,
		returnUrl,
	}: {
		cartItems: CheckoutCartItem[];
		minecraftUsername: string;
		returnUrl?: string;
	}) => {
		setIsLoading(true);
		setError(null);

		try {
			// Validate inputs
			if (!cartItems.length) {
				throw new Error("Cart is empty");
			}

			if (!minecraftUsername) {
				throw new Error("Minecraft username is required");
			}

			// Make API request to create checkout session
			const response = await fetch("/api/stripe/checkout", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					cartItems,
					minecraftUsername,
					returnUrl,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to create checkout session");
			}

			// Redirect to Stripe Checkout if option is enabled
			if (redirectToCheckout && data.checkoutUrl) {
				window.location.href = data.checkoutUrl;
				return null;
			}

			return data;
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : "An unknown error occurred";
			setError(errorMessage);

			toast({
				title: "Checkout Error",
				description: errorMessage,
				variant: "destructive",
			});

			return null;
		} finally {
			setIsLoading(false);
		}
	};

	return {
		createCheckoutSession,
		isLoading,
		error,
	};
}
