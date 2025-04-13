/**
 * Store-related type definitions
 */

export interface StoreItem {
	id: number;
	name: string;
	description: string;
	price: number;
	sale_price: number | null;
	category_id: number | null;
	image_url: string | null;
	active: boolean;
	on_sale: boolean;
	created_at?: string;
	updated_at?: string;
	category_name?: string;
}

export interface StoreCategory {
	id: number;
	name: string;
	description: string | null;
	order_index: number;
	active: boolean;
}

export interface CartItem {
	item: StoreItem;
	quantity: number;
	paymentMethodId: number | null;
	discountCode?: string;
}

/**
 * Represents a discount code in the store
 */
export interface StoreDiscount {
	id: number;
	code: string;
	percentage: number;
	valid_from: string;
	valid_until: string;
	max_uses: number;
	times_used: number;
	active: boolean;
	created_at: string;
	updated_at: string;
}

export interface StorePaymentMethod {
	id: number;
	name: string;
	description: string | null;
	active: boolean;
}

export interface StoreContext {
	cartItems: CartItem[];
	addToCart: (item: StoreItem, paymentMethodId: number) => void;
	removeFromCart: (itemId: number) => void;
	updateCartItemQuantity: (itemId: number, quantity: number) => void;
	updateCartItemPaymentMethod: (
		itemId: number,
		paymentMethodId: number,
	) => void;
	applyDiscountCode: (itemId: number, code: string) => void;
	clearCart: () => void;
	cartTotal: number;
	cartCount: number;
	minecraftUsername: string;
	setMinecraftUsername: (username: string) => void;
}
