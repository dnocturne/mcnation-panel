import { pool } from "@/lib/db";
import type {
	StoreItem,
	StoreCategory,
	StorePaymentMethod,
} from "@/lib/types/store";

/**
 * Fetch store items with optional filtering for active items and by category
 */
export async function getStoreItems(
	activeOnly = true,
	categoryId?: number,
): Promise<StoreItem[]> {
	let query = "SELECT * FROM store_items";
	const params = [];

	if (activeOnly || categoryId !== undefined) {
		query += " WHERE";

		if (activeOnly) {
			query += " active = TRUE";
			if (categoryId !== undefined) {
				query += " AND";
			}
		}

		if (categoryId !== undefined) {
			query += " category_id = ?";
			params.push(categoryId);
		}
	}

	query += " ORDER BY name";

	try {
		const [rows] = await pool.execute(query, params);
		return rows as StoreItem[];
	} catch (error) {
		console.error("Error fetching store items:", error);
		throw new Error("Failed to fetch store items");
	}
}

/**
 * Fetch a single store item by ID
 */
export async function getStoreItemById(id: number): Promise<StoreItem | null> {
	try {
		const [rows] = await pool.execute(
			"SELECT * FROM store_items WHERE id = ?",
			[id],
		);

		const items = rows as StoreItem[];
		return items.length > 0 ? items[0] : null;
	} catch (error) {
		console.error(`Error fetching store item with ID ${id}:`, error);
		throw new Error("Failed to fetch store item");
	}
}

/**
 * Fetch all store categories with optional filtering for active categories
 */
export async function getStoreCategories(
	activeOnly = true,
): Promise<StoreCategory[]> {
	try {
		const [rows] = await pool.execute(
			"SELECT * FROM store_categories WHERE active = ? ORDER BY order_index",
			[activeOnly],
		);

		return rows as StoreCategory[];
	} catch (error) {
		console.error("Error fetching store categories:", error);
		throw new Error("Failed to fetch store categories");
	}
}

/**
 * Fetch payment methods with optional filtering for active methods
 */
export async function getPaymentMethods(
	activeOnly = true,
): Promise<StorePaymentMethod[]> {
	try {
		const [rows] = await pool.execute(
			"SELECT * FROM store_payment_methods WHERE active = ?",
			[activeOnly],
		);

		return rows as StorePaymentMethod[];
	} catch (error) {
		console.error("Error fetching payment methods:", error);
		throw new Error("Failed to fetch payment methods");
	}
}
