import { describe, it, expect, beforeEach, mock } from "bun:test";
import {
	getCategories,
	getItems,
	validateDiscountCode,
	createCategory,
	updateCategory,
	deleteCategory,
	type StoreCategory,
} from "../webstore";
import { pool } from "@/lib/db";

// Create mock functions with properly typed parameters
const mockExecute = mock((..._: unknown[]) => Promise.resolve([[]] as unknown));
const mockGetConnection = mock(() => Promise.resolve({}));

// Override the pool import with our mocks
// @ts-expect-error - Overriding module properties
pool.execute = mockExecute;
// @ts-expect-error - Overriding module properties
pool.getConnection = mockGetConnection;

describe("Webstore Database Functions", () => {
	// Clear mocks before each test
	beforeEach(() => {
		mockExecute.mockClear();
		mockGetConnection.mockClear();
	});

	describe("getCategories", () => {
		it("should fetch active categories by default", async () => {
			// Mock the pool.execute return value
			const mockRows = [
				{ id: 1, name: "Ranks", active: true },
				{ id: 2, name: "Cosmetics", active: true },
			];

			mockExecute.mockImplementation(() => Promise.resolve([mockRows]));

			// Call the function
			const result = await getCategories();

			// Check that the query was called
			expect(mockExecute.mock.calls.length).toBeGreaterThan(0);

			// Check the result
			expect(result).toEqual(mockRows);
		});

		it("should fetch all categories when activeOnly is false", async () => {
			// Mock the pool.execute return value
			const mockRows = [
				{ id: 1, name: "Ranks", active: true },
				{ id: 2, name: "Cosmetics", active: false },
			];

			mockExecute.mockImplementation(() => Promise.resolve([mockRows]));

			// Call the function
			const result = await getCategories(false);

			// Check that the query was called
			expect(mockExecute.mock.calls.length).toBeGreaterThan(0);

			// Check the result
			expect(result).toEqual(mockRows);
		});
	});

	describe("getItems", () => {
		it("should fetch active items by default", async () => {
			const mockRows = [
				{ id: 1, name: "VIP Rank", active: true },
				{ id: 2, name: "MVP Rank", active: true },
			];

			mockExecute.mockImplementation(() => Promise.resolve([mockRows]));

			const result = await getItems();

			expect(mockExecute.mock.calls.length).toBeGreaterThan(0);
			expect(result).toEqual(mockRows);
		});

		it("should filter items by category if provided", async () => {
			const mockRows = [{ id: 1, name: "VIP Rank", category_id: 1 }];

			mockExecute.mockImplementation(() => Promise.resolve([mockRows]));

			const result = await getItems(true, 1);

			expect(mockExecute.mock.calls.length).toBeGreaterThan(0);
			expect(result).toEqual(mockRows);
		});
	});

	describe("validateDiscountCode", () => {
		it("should validate a valid discount code", async () => {
			const mockDiscounts = [{ code: "VALID10", percentage: 10, active: true }];

			mockExecute.mockImplementation(() => Promise.resolve([mockDiscounts]));

			const result = await validateDiscountCode("VALID10");

			expect(mockExecute.mock.calls.length).toBeGreaterThan(0);
			expect(result).toEqual({
				valid: true,
				percentage: 10,
			});
		});

		it("should return invalid for non-existent discount codes", async () => {
			mockExecute.mockImplementation(() => Promise.resolve([[]]));

			const result = await validateDiscountCode("INVALID");

			expect(result).toEqual({
				valid: false,
			});
		});
	});

	// Test CRUD operations
	describe("Category CRUD Operations", () => {
		it("should create a category correctly", async () => {
			const mockResult = { insertId: 1, affectedRows: 1 };
			mockExecute.mockImplementation(() => Promise.resolve([mockResult]));

			const id = await createCategory("Test Category", "Description", 1);

			expect(mockExecute.mock.calls.length).toBeGreaterThan(0);
			expect(id).toBe(1);
		});

		it("should update a category correctly", async () => {
			const mockResult = { affectedRows: 1 };
			mockExecute.mockImplementation(() => Promise.resolve([mockResult]));

			const result = await updateCategory(1, {
				name: "Updated Category",
			} as Partial<StoreCategory>);

			expect(mockExecute.mock.calls.length).toBeGreaterThan(0);
			expect(result).toBe(true);
		});

		it("should delete a category", async () => {
			const mockResult = { affectedRows: 1 };
			mockExecute.mockImplementation(() => Promise.resolve([mockResult]));

			const result = await deleteCategory(1);

			expect(mockExecute.mock.calls.length).toBeGreaterThan(0);
			expect(result).toBe(true);
		});
	});
});
