import { describe, it, expect, beforeEach, afterEach, mock } from "bun:test";
import { GET, POST } from "../route";
import type { NextRequest } from "next/server";

// Setup mock state
interface MockSession {
	user: {
		role: string;
	};
}

let mockSession: MockSession | null = null;
let mockThrowError = false;
const mockDiscounts = [{ id: 1, code: "TEST10", percentage: 10 }];

// Create mock functions that will be imported by the modules
const mockGetServerSession = mock(() => Promise.resolve(mockSession));
const mockGetDiscounts = mock((...args: unknown[]) => {
	if (mockThrowError) throw new Error("Database error");
	return Promise.resolve(mockDiscounts);
});
const mockCreateDiscount = mock((...args: unknown[]) => {
	if (mockThrowError) throw new Error("Database error");
	const discountData = args[0] as Record<string, unknown>;
	return Promise.resolve({ id: 1, ...discountData });
});

// Mock the modules before they are imported in the route
// This uses Bun's mocking mechanism which is compatible with ESM
mock.module("next-auth", () => ({
	getServerSession: mockGetServerSession,
}));

mock.module("@/lib/database/webstore", () => ({
	getDiscounts: mockGetDiscounts,
	createDiscount: mockCreateDiscount,
}));

describe("Discounts API", () => {
	beforeEach(() => {
		// Reset mocks for each test
		mockSession = null;
		mockThrowError = false;
		mockGetServerSession.mockClear();
		mockGetDiscounts.mockClear();
		mockCreateDiscount.mockClear();
	});

	afterEach(() => {
		// No need for jest.clearAllMocks() with Bun
	});

	describe("GET handler", () => {
		it("should return a response", async () => {
			// Use explicit type as unknown to avoid type errors
			const req = {} as unknown as Parameters<typeof GET>[0];
			const response = await GET(req);

			// Verify some basic properties
			expect(response.status).toBeTruthy();
		});

		it("should return 401 when not authenticated", async () => {
			// Prepare
			const req = {
				url: "http://localhost/api/webstore/discounts",
			} as unknown as Parameters<typeof GET>[0];

			// Execute
			const response = await GET(req);

			// Assert
			expect(response.status).toBe(401);

			const data = await response.json();
			expect(data.error).toBeTruthy();
			expect(data.code).toBe("unauthorized");
		});

		it("should return 403 when user is not an admin", async () => {
			mockSession = {
				user: { role: "user" },
			};

			const request = {
				url: "http://localhost/api/webstore/discounts",
			} as unknown as Parameters<typeof GET>[0];
			const response = await GET(request);
			expect(response.status).toBe(403);

			const data = await response.json();
			expect(data.error).toBeTruthy();
			expect(data.code).toBe("forbidden");
		});

		it("should return discounts when user is admin", async () => {
			mockSession = {
				user: { role: "admin" },
			};

			const request = {
				url: "http://localhost/api/webstore/discounts",
			} as unknown as Parameters<typeof GET>[0];
			const response = await GET(request);
			expect(response.status).toBe(200);

			const data = await response.json();
			expect(data.success).toBe(true);
			expect(data.data).toEqual(mockDiscounts);
		});

		it("should handle errors", async () => {
			mockSession = {
				user: { role: "admin" },
			};
			mockThrowError = true;

			const request = {
				url: "http://localhost/api/webstore/discounts",
			} as unknown as Parameters<typeof GET>[0];
			const response = await GET(request);
			expect(response.status).toBe(500);

			const data = await response.json();
			expect(data.error).toBeTruthy();
		});
	});

	describe("POST handler", () => {
		it("should return a response", async () => {
			// Use explicit type as unknown to avoid type errors
			const req = {
				json: async () => ({ code: "TEST20", percentage: 20 }),
			} as unknown as Parameters<typeof POST>[0];

			const response = await POST(req);

			// Verify some basic properties
			expect(response.status).toBeTruthy();
		});

		it("should return 401 when not authenticated", async () => {
			// Prepare
			const req = {
				url: "http://localhost/api/webstore/discounts",
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ code: "TEST20", percentage: 20 }),
				json: async () => ({ code: "TEST20", percentage: 20 }),
			} as unknown as Parameters<typeof POST>[0];

			// Execute
			const response = await POST(req);

			// Assert
			expect(response.status).toBe(401);

			const data = await response.json();
			expect(data.error).toBeTruthy();
		});

		it("should create a discount when admin is authenticated", async () => {
			mockSession = {
				user: { role: "admin" },
			};

			const discountData = {
				code: "NEW20",
				percentage: 20,
				valid_from: "2023-01-01",
				valid_until: "2023-12-31",
				max_uses: 100,
				active: true,
			};

			const request = {
				url: "http://localhost/api/webstore/discounts",
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(discountData),
				json: async () => discountData,
			} as unknown as Parameters<typeof POST>[0];

			const response = await POST(request);
			expect(response.status).toBe(201);

			const data = await response.json();
			expect(data.success).toBe(true);
			expect(data.data).toBeTruthy();
			expect(data.data.id).toBeTruthy();
			expect(data.data.code).toBe(discountData.code);
		});

		it("should handle API errors", async () => {
			mockSession = {
				user: { role: "admin" },
			};
			mockThrowError = true;

			const request = {
				url: "http://localhost/api/webstore/discounts",
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ code: "ERROR20", percentage: 20 }),
				json: async () => ({ code: "ERROR20", percentage: 20 }),
			} as unknown as Parameters<typeof POST>[0];

			const response = await POST(request);
			expect(response.status).toBe(500);

			const data = await response.json();
			expect(data.error).toBeTruthy();
		});
	});
});
