import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, mock } from "bun:test";
import { useStoreDiscounts } from "../use-store-discounts";
import { SWRConfig } from "swr";
import type { StoreDiscount } from "@/lib/types/store";

// Import modules we want to mock
import * as storeApi from "@/lib/api/store-api";
import * as nextNavigation from "next/navigation";
import * as nextAuth from "next-auth/react";

// Mock response data
const mockDiscounts: StoreDiscount[] = [
	{
		id: 1,
		code: "SUMMER20",
		percentage: 20,
		valid_from: "2023-01-01",
		valid_until: "2023-12-31",
		max_uses: 100,
		times_used: 0,
		active: true,
		created_at: "2023-01-01",
		updated_at: "2023-01-01",
	},
];

// Setup test state
let mockAuthStatus = "authenticated";
let mockIsAdmin = true;
let mockRouterPushCalled = false;
let mockFetchCalled = false;

// Create mock functions
const mockFetchDiscounts = mock(async () => {
	mockFetchCalled = true;
	return {
		success: true,
		data: mockDiscounts,
	};
});

const mockRouterPush = mock((...args: unknown[]) => {
	mockRouterPushCalled = true;
});

const mockUseSession = mock(() => ({
	data: mockIsAdmin
		? {
				user: {
					role: "admin",
				},
			}
		: null,
	status: mockAuthStatus,
}));

// Override the imported modules with our mocks
// @ts-expect-error - Overriding module methods for testing
storeApi.fetchDiscounts = mockFetchDiscounts;

// @ts-expect-error - Overriding module methods for testing
nextNavigation.useRouter = () => ({ push: mockRouterPush });

// @ts-expect-error - Overriding module methods for testing
nextAuth.useSession = mockUseSession;

// SWR Wrapper to reset cache between tests
const SWRWrapper = ({ children }: { children: React.ReactNode }) => (
	<SWRConfig value={{ provider: () => new Map() }}>{children}</SWRConfig>
);

// Test component that uses our hook
function TestComponent({ requireAuth = true }: { requireAuth?: boolean }) {
	const { discounts, isLoading, isError, isAuthenticated, isAdmin } =
		useStoreDiscounts({ requireAuth });

	return (
		<div>
			<div data-testid="loading">{String(isLoading)}</div>
			<div data-testid="error">{String(!!isError)}</div>
			<div data-testid="authenticated">{String(isAuthenticated)}</div>
			<div data-testid="admin">{String(isAdmin)}</div>
			<div data-testid="discounts-length">{discounts?.length || 0}</div>
		</div>
	);
}

describe("useStoreDiscounts hook", () => {
	// Reset state before each test
	beforeEach(() => {
		mockAuthStatus = "authenticated";
		mockIsAdmin = true;
		mockRouterPushCalled = false;
		mockFetchCalled = false;
		mockFetchDiscounts.mockClear();
		mockRouterPush.mockClear();
	});

	afterEach(() => {
		// Clear any rendered components
		document.body.innerHTML = "";
	});

	it("should fetch discounts when authenticated", async () => {
		render(
			<SWRWrapper>
				<TestComponent />
			</SWRWrapper>,
		);

		// Initial state should be loading
		expect(screen.getByTestId("loading").textContent).toBe("true");

		// Wait for the hook to finish loading
		await new Promise((resolve) => setTimeout(resolve, 100));

		// After loading, the data should be available
		expect(mockFetchCalled).toBe(true);
		expect(screen.getByTestId("loading").textContent).toBe("false");
		expect(screen.getByTestId("discounts-length").textContent).toBe("1");
		expect(screen.getByTestId("authenticated").textContent).toBe("true");
		expect(screen.getByTestId("admin").textContent).toBe("true");
	});

	it("should not fetch when unauthenticated and requireAuth is true", async () => {
		mockAuthStatus = "unauthenticated";
		mockIsAdmin = false;

		render(
			<SWRWrapper>
				<TestComponent />
			</SWRWrapper>,
		);

		// Wait to make sure no fetch happens
		await new Promise((resolve) => setTimeout(resolve, 100));

		expect(mockFetchCalled).toBe(false);
		expect(screen.getByTestId("authenticated").textContent).toBe("false");
	});

	it("should fetch when unauthenticated but requireAuth is false", async () => {
		mockAuthStatus = "unauthenticated";
		mockIsAdmin = false;

		render(
			<SWRWrapper>
				<TestComponent requireAuth={false} />
			</SWRWrapper>,
		);

		// Wait for the hook to finish
		await new Promise((resolve) => setTimeout(resolve, 100));

		expect(mockFetchCalled).toBe(true);
	});
});
