import type React from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Create a custom render method that includes providers
const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				retry: false,
			},
		},
	});

	return (
		<QueryClientProvider client={queryClient}>
			<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
				{children}
			</ThemeProvider>
		</QueryClientProvider>
	);
};

const customRender = (
	ui: React.ReactElement,
	options?: Omit<RenderOptions, "wrapper">,
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything from testing-library
export * from "@testing-library/react";
export { customRender as render };

// Mock function to help with testing form submissions
export const mockSubmit = (e: { preventDefault: () => void }) => {
	e.preventDefault();
	return Promise.resolve();
};

// Helper to create fake data for tests
export const createFakeUser = (overrides = {}) => ({
	id: "1",
	name: "Test User",
	email: "test@example.com",
	role: "user",
	...overrides,
});

export const createFakeItem = (overrides = {}) => ({
	id: 1,
	name: "Test Item",
	description: "A test item for the store",
	price: 9.99,
	sale_price: null,
	category_id: 1,
	image_url: "/images/items/test.png",
	active: true,
	created_at: new Date().toISOString(),
	updated_at: new Date().toISOString(),
	...overrides,
});

export const createFakeCategory = (overrides = {}) => ({
	id: 1,
	name: "Test Category",
	description: "A test category",
	order_index: 1,
	active: true,
	...overrides,
});

export const createFakeDiscount = (overrides = {}) => ({
	id: 1,
	code: "TESTCODE",
	percentage: 20,
	valid_from: new Date().toISOString(),
	valid_until: new Date(Date.now() + 86400000).toISOString(),
	max_uses: 100,
	times_used: 5,
	active: true,
	...overrides,
});

export const createFakePurchase = (overrides = {}) => ({
	id: 1,
	minecraft_uuid: "123e4567-e89b-12d3-a456-426614174000",
	item_id: 1,
	payment_method_id: 1,
	discount_id: null,
	amount: 9.99,
	status: "completed",
	transaction_id: "txn_123456",
	notes: null,
	created_at: new Date().toISOString(),
	updated_at: new Date().toISOString(),
	...overrides,
});
