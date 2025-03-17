import { http, HttpResponse } from "msw";
import {
	createFakeUser,
	createFakeItem,
	createFakeCategory,
	createFakeDiscount,
	createFakePurchase,
} from "../test-utils";

// Mock data for consistent testing
const mockItems = [
	createFakeItem({ id: 1, name: "VIP Rank" }),
	createFakeItem({ id: 2, name: "MVP Rank" }),
	createFakeItem({ id: 3, name: "Custom Tag" }),
];

const mockCategories = [
	createFakeCategory({ id: 1, name: "Ranks" }),
	createFakeCategory({ id: 2, name: "Cosmetics" }),
];

const mockDiscounts = [
	createFakeDiscount({ id: 1, code: "SUMMER20" }),
	createFakeDiscount({ id: 2, code: "NEWUSER10", percentage: 10 }),
];

const mockPurchases = [
	createFakePurchase({ id: 1 }),
	createFakePurchase({ id: 2, status: "pending" }),
];

// Create mock API handlers
export const handlers = [
	// Auth endpoints
	http.post("/api/auth/login", () => {
		return HttpResponse.json({
			user: createFakeUser(),
			token: "mock-jwt-token",
		});
	}),

	// Items endpoints
	http.get("/api/webstore/items", () => {
		return HttpResponse.json(mockItems);
	}),

	http.get("/api/webstore/items/:id", ({ params }) => {
		const { id } = params;
		const item = mockItems.find((i) => i.id === Number(id));
		if (!item) {
			return new HttpResponse(null, { status: 404 });
		}
		return HttpResponse.json(item);
	}),

	http.post("/api/webstore/items", async ({ request }) => {
		const data = (await request.json()) as Record<string, unknown>;
		const newItem = createFakeItem({ ...data, id: mockItems.length + 1 });
		return HttpResponse.json(newItem, { status: 201 });
	}),

	// Categories endpoints
	http.get("/api/webstore/categories", () => {
		return HttpResponse.json(mockCategories);
	}),

	// Discounts endpoints
	http.get("/api/webstore/discounts", () => {
		return HttpResponse.json({ success: true, discounts: mockDiscounts });
	}),

	http.get("/api/webstore/discounts/:id", ({ params }) => {
		const { id } = params;
		const discount = mockDiscounts.find((d) => d.id === Number(id));
		if (!discount) {
			return new HttpResponse(null, { status: 404 });
		}
		return HttpResponse.json(discount);
	}),

	// Purchases endpoints
	http.get("/api/webstore/purchases", () => {
		return HttpResponse.json({
			data: mockPurchases,
			pagination: {
				page: 1,
				limit: 25,
				totalRecords: mockPurchases.length,
				totalPages: 1,
				hasNextPage: false,
				hasPrevPage: false,
			},
		});
	}),

	// Server config endpoints
	http.get("/api/server/config", () => {
		return HttpResponse.json({
			host: "localhost",
			port: 25565,
			apiKey: "mock-api-key",
		});
	}),
];
