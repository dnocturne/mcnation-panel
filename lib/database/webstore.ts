import { pool } from "@/lib/db";
import type { RowDataPacket } from "mysql2";
import { runMigrations } from "./migrations";

// Interfaces
export interface StoreItem extends RowDataPacket {
	id: number;
	name: string;
	description: string;
	price: number;
	sale_price: number | null;
	category_id: number;
	image_url: string | null;
	active: boolean;
	on_sale: boolean;
	created_at: Date;
	updated_at: Date;
}

export interface StoreCategory extends RowDataPacket {
	id: number;
	name: string;
	description: string | null;
	order_index: number;
	active: boolean;
}

export interface StoreDiscount extends RowDataPacket {
	id: number;
	code: string;
	percentage: number;
	valid_from: Date;
	valid_until: Date | null;
	max_uses: number | null;
	times_used: number;
	active: boolean;
}

export interface StorePaymentMethod extends RowDataPacket {
	id: number;
	name: string;
	description: string | null;
	active: boolean;
}

export interface ItemPaymentMethod extends RowDataPacket {
	item_id: number;
	payment_method_id: number;
}

export interface StorePurchase extends RowDataPacket {
	id: number;
	minecraft_uuid: string;
	item_id: number;
	payment_method_id: number;
	discount_id: number | null;
	status: string;
	price_paid: number;
	transaction_id: string | null;
	created_at: Date;
	updated_at: Date;
}

export interface MySQLResult {
	insertId: number;
	affectedRows: number;
	changedRows?: number;
}

// Functions to ensure tables exist
export async function ensureWebstoreTables() {
	const connection = await pool.getConnection();
	try {
		// Create store_categories table
		await connection.execute(`
      CREATE TABLE IF NOT EXISTS store_categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        order_index INT NOT NULL DEFAULT 0,
        active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

		// Create store_items table
		await connection.execute(`
      CREATE TABLE IF NOT EXISTS store_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        sale_price DECIMAL(10, 2),
        category_id INT,
        image_url VARCHAR(255),
        active BOOLEAN NOT NULL DEFAULT TRUE,
        on_sale BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES store_categories(id) ON DELETE SET NULL
      )
    `);

		// Create store_discounts table
		await connection.execute(`
      CREATE TABLE IF NOT EXISTS store_discounts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(50) NOT NULL UNIQUE,
        percentage INT NOT NULL,
        valid_from TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        valid_until TIMESTAMP NULL,
        max_uses INT,
        times_used INT NOT NULL DEFAULT 0,
        active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

		// Create store_payment_methods table
		await connection.execute(`
      CREATE TABLE IF NOT EXISTS store_payment_methods (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

		// Create item_payment_methods (junction table)
		await connection.execute(`
      CREATE TABLE IF NOT EXISTS item_payment_methods (
        item_id INT NOT NULL,
        payment_method_id INT NOT NULL,
        PRIMARY KEY (item_id, payment_method_id),
        FOREIGN KEY (item_id) REFERENCES store_items(id) ON DELETE CASCADE,
        FOREIGN KEY (payment_method_id) REFERENCES store_payment_methods(id) ON DELETE CASCADE
      )
    `);

		// Create store_purchases table
		await connection.execute(`
      CREATE TABLE IF NOT EXISTS store_purchases (
        id INT AUTO_INCREMENT PRIMARY KEY,
        minecraft_uuid VARCHAR(36) NOT NULL,
        item_id INT NOT NULL,
        payment_method_id INT NOT NULL,
        discount_id INT,
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        price_paid DECIMAL(10, 2) NOT NULL,
        transaction_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (item_id) REFERENCES store_items(id) ON DELETE CASCADE,
        FOREIGN KEY (payment_method_id) REFERENCES store_payment_methods(id) ON DELETE CASCADE,
        FOREIGN KEY (discount_id) REFERENCES store_discounts(id) ON DELETE SET NULL
      )
    `);

		// Insert default payment methods if they don't exist
		await connection.execute(`
      INSERT IGNORE INTO store_payment_methods (name, description) VALUES 
      ('Credit Card', 'Pay with Visa, Mastercard, or American Express'), 
      ('PayPal', 'Pay with your PayPal account'),
      ('Stripe', 'Fast and secure checkout with Stripe')
    `);

		// Insert default category if no categories exist
		const [categoryRows] = await connection.execute<RowDataPacket[]>(
			"SELECT COUNT(*) as count FROM store_categories",
		);

		if (categoryRows[0].count === 0) {
			await connection.execute(`
        INSERT INTO store_categories (name, description, order_index) VALUES 
        ('Featured', 'Featured items', 0),
        ('Ranks', 'Server rank upgrades', 1),
        ('Cosmetics', 'Cosmetic items and effects', 2),
        ('Gameplay', 'Gameplay enhancing items', 3)
      `);
		}
	} finally {
		connection.release();
	}

	// Run migrations to ensure database schema is up to date
	await runMigrations();
}

// CRUD operations for categories
export async function getCategories(
	activeOnly = true,
): Promise<StoreCategory[]> {
	const query = activeOnly
		? "SELECT * FROM store_categories WHERE active = TRUE ORDER BY order_index"
		: "SELECT * FROM store_categories ORDER BY order_index";

	const [rows] = await pool.execute<StoreCategory[]>(query);
	return rows;
}

export async function getCategoryById(
	id: number,
): Promise<StoreCategory | null> {
	const [rows] = await pool.execute<StoreCategory[]>(
		"SELECT * FROM store_categories WHERE id = ?",
		[id],
	);
	return rows.length > 0 ? rows[0] : null;
}

export async function createCategory(
	name: string,
	description: string | null,
	orderIndex: number,
): Promise<number> {
	const [result] = await pool.execute(
		"INSERT INTO store_categories (name, description, order_index) VALUES (?, ?, ?)",
		[name, description, orderIndex],
	);
	return (result as MySQLResult).insertId;
}

export async function updateCategory(
	id: number,
	data: Partial<StoreCategory>,
): Promise<boolean> {
	const fields = Object.entries(data).filter(
		([key]) => key !== "id" && key !== "created_at" && key !== "updated_at",
	);

	if (fields.length === 0) return false;

	const setClause = fields.map(([key]) => `${key} = ?`).join(", ");
	const [result] = await pool.execute(
		`UPDATE store_categories SET ${setClause}, updated_at = NOW() WHERE id = ?`,
		[...fields.map(([, value]) => value), id],
	);

	return (result as MySQLResult).affectedRows > 0;
}

export async function deleteCategory(id: number): Promise<boolean> {
	try {
		const [result] = await pool.execute(
			"DELETE FROM store_categories WHERE id = ?",
			[id],
		);
		return (result as MySQLResult).affectedRows > 0;
	} catch (error: unknown) {
		console.error("Error deleting category:", error);
		return false;
	}
}

// CRUD operations for items
export async function getItems(
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

	const [rows] = await pool.execute<StoreItem[]>(query, params);
	return rows;
}

export async function getItemById(id: number): Promise<StoreItem | null> {
	const [rows] = await pool.execute<StoreItem[]>(
		"SELECT * FROM store_items WHERE id = ?",
		[id],
	);
	return rows.length > 0 ? rows[0] : null;
}

export async function createItem(data: Partial<StoreItem>): Promise<number> {
	const fields = Object.entries(data).filter(
		([key]) => key !== "id" && key !== "created_at" && key !== "updated_at",
	);

	const columns = fields.map(([key]) => key).join(", ");
	const placeholders = fields.map(() => "?").join(", ");

	const query = `INSERT INTO store_items (${columns}) VALUES (${placeholders})`;
	const [result] = await pool.execute(
		query,
		fields.map(([, value]) => value),
	);

	return (result as MySQLResult).insertId;
}

export async function updateItem(
	id: number,
	data: Partial<StoreItem>,
): Promise<boolean> {
	const fields = Object.entries(data).filter(
		([key]) => key !== "id" && key !== "created_at" && key !== "updated_at",
	);

	if (fields.length === 0) return false;

	const query = `
    UPDATE store_items 
    SET ${fields.map(([key]) => `${key} = ?`).join(", ")}
    WHERE id = ?
  `;

	const [result] = await pool.execute(query, [
		...fields.map(([, value]) => value),
		id,
	]);

	return (result as MySQLResult).affectedRows > 0;
}

export async function deleteItem(id: number): Promise<boolean> {
	try {
		const [result] = await pool.execute(
			"DELETE FROM store_items WHERE id = ?",
			[id],
		);
		return (result as MySQLResult).affectedRows > 0;
	} catch (error: unknown) {
		console.error("Error deleting item:", error);
		return false;
	}
}

// Payment method operations
export async function getPaymentMethods(
	activeOnly = true,
): Promise<StorePaymentMethod[]> {
	const query = activeOnly
		? "SELECT * FROM store_payment_methods WHERE active = TRUE ORDER BY name"
		: "SELECT * FROM store_payment_methods ORDER BY name";

	const [rows] = await pool.execute<StorePaymentMethod[]>(query);
	return rows;
}

export async function getItemPaymentMethods(
	itemId: number,
): Promise<StorePaymentMethod[]> {
	const query = `
    SELECT pm.* FROM store_payment_methods pm
    JOIN item_payment_methods ipm ON pm.id = ipm.payment_method_id
    WHERE ipm.item_id = ? AND pm.active = TRUE
  `;

	const [rows] = await pool.execute<StorePaymentMethod[]>(query, [itemId]);
	return rows;
}

export async function setItemPaymentMethods(
	itemId: number,
	paymentMethodIds: number[],
): Promise<boolean> {
	const connection = await pool.getConnection();

	try {
		await connection.beginTransaction();

		// Delete existing payment methods for this item
		await connection.execute(
			"DELETE FROM item_payment_methods WHERE item_id = ?",
			[itemId],
		);

		// Insert new payment methods
		if (paymentMethodIds.length > 0) {
			const placeholders = paymentMethodIds.map(() => "(?, ?)").join(", ");
			const params = paymentMethodIds.flatMap((methodId) => [itemId, methodId]);

			await connection.execute(
				`INSERT INTO item_payment_methods (item_id, payment_method_id) VALUES ${placeholders}`,
				params,
			);
		}

		await connection.commit();
		return true;
	} catch (error) {
		await connection.rollback();
		console.error("Error setting item payment methods:", error);
		return false;
	} finally {
		connection.release();
	}
}

// Discount code operations
export async function getDiscounts(
	activeOnly = true,
): Promise<StoreDiscount[]> {
	const query = activeOnly
		? "SELECT * FROM store_discounts WHERE active = TRUE ORDER BY code"
		: "SELECT * FROM store_discounts ORDER BY code";

	const [rows] = await pool.execute<StoreDiscount[]>(query);
	return rows;
}

export async function getDiscountByCode(
	code: string,
): Promise<StoreDiscount | null> {
	const [rows] = await pool.execute<StoreDiscount[]>(
		"SELECT * FROM store_discounts WHERE code = ?",
		[code],
	);
	return rows.length > 0 ? rows[0] : null;
}

export async function createDiscount(
	data: Partial<StoreDiscount>,
): Promise<number> {
	const fields = Object.entries(data).filter(
		([key]) => key !== "id" && key !== "created_at" && key !== "updated_at",
	);

	const columns = fields.map(([key]) => key).join(", ");
	const placeholders = fields.map(() => "?").join(", ");

	const query = `INSERT INTO store_discounts (${columns}) VALUES (${placeholders})`;
	const [result] = await pool.execute(
		query,
		fields.map(([, value]) => value),
	);

	return (result as MySQLResult).insertId;
}

export async function updateDiscount(
	id: number,
	data: Partial<StoreDiscount>,
): Promise<boolean> {
	const fields = Object.entries(data).filter(
		([key]) => key !== "id" && key !== "created_at" && key !== "updated_at",
	);

	if (fields.length === 0) return false;

	const query = `
    UPDATE store_discounts 
    SET ${fields.map(([key]) => `${key} = ?`).join(", ")}
    WHERE id = ?
  `;

	const [result] = await pool.execute(query, [
		...fields.map(([, value]) => value),
		id,
	]);

	return (result as MySQLResult).affectedRows > 0;
}

export async function deleteDiscount(id: number): Promise<boolean> {
	try {
		const [result] = await pool.execute(
			"DELETE FROM store_discounts WHERE id = ?",
			[id],
		);
		return (result as MySQLResult).affectedRows > 0;
	} catch (error: unknown) {
		console.error("Error deleting discount:", error);
		return false;
	}
}

// Check if a discount code is valid
export async function validateDiscountCode(
	code: string,
): Promise<{ valid: boolean; percentage?: number }> {
	const [rows] = await pool.execute<StoreDiscount[]>(
		`SELECT * FROM store_discounts WHERE code = ? AND active = TRUE 
     AND (valid_until IS NULL OR valid_until > NOW())
     AND (max_uses IS NULL OR times_used < max_uses)`,
		[code],
	);

	if (rows.length === 0) {
		return { valid: false };
	}

	return {
		valid: true,
		percentage: rows[0].percentage,
	};
}

// Use a discount code (increment times_used)
export async function useDiscountCode(code: string): Promise<boolean> {
	try {
		const [result] = await pool.execute(
			"UPDATE store_discounts SET times_used = times_used + 1 WHERE code = ? AND active = 1",
			[code],
		);
		return (result as MySQLResult).affectedRows > 0;
	} catch (error: unknown) {
		console.error("Error using discount code:", error);
		return false;
	}
}

// CRUD operations for purchases
export async function getPurchases(
	options: {
		minecraftUuid?: string;
		itemId?: number;
		status?: string;
		paymentMethodId?: number;
		page?: number;
		limit?: number;
		fromDate?: string;
		toDate?: string;
	} = {},
): Promise<{
	purchases: StorePurchase[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}> {
	const {
		minecraftUuid,
		itemId,
		status,
		paymentMethodId,
		page = 1,
		limit = 25,
		fromDate,
		toDate,
	} = options;

	let query = `
    SELECT p.*, i.name as item_name, pm.name as payment_method_name 
    FROM store_purchases p
    LEFT JOIN store_items i ON p.item_id = i.id
    LEFT JOIN store_payment_methods pm ON p.payment_method_id = pm.id
    WHERE 1=1
  `;

	const params: (string | number)[] = [];

	// Add filters if provided
	if (minecraftUuid) {
		query += " AND p.minecraft_uuid = ?";
		params.push(minecraftUuid);
	}

	if (itemId) {
		query += " AND p.item_id = ?";
		params.push(itemId);
	}

	if (status) {
		query += " AND p.status = ?";
		params.push(status);
	}

	if (paymentMethodId) {
		query += " AND p.payment_method_id = ?";
		params.push(paymentMethodId);
	}

	if (fromDate) {
		query += " AND p.created_at >= ?";
		params.push(fromDate);
	}

	if (toDate) {
		query += " AND p.created_at <= ?";
		params.push(toDate);
	}

	// Count total records for pagination
	const countQuery = query.replace(
		"SELECT p.*, i.name as item_name, pm.name as payment_method_name",
		"SELECT COUNT(*) as total",
	);
	const [countRows] = await pool.execute<RowDataPacket[]>(countQuery, params);
	const total = countRows[0].total;

	// Add sorting and pagination
	const offset = (page - 1) * limit;
	query += " ORDER BY p.created_at DESC LIMIT ? OFFSET ?";
	params.push(limit, offset);

	// Execute the query
	const [rows] = await pool.execute<StorePurchase[]>(query, params);

	// Calculate pagination metadata
	const totalPages = Math.ceil(total / limit);

	return {
		purchases: rows,
		total,
		page,
		limit,
		totalPages,
	};
}

export async function getPurchaseById(
	id: number,
): Promise<StorePurchase | null> {
	const [rows] = await pool.execute<StorePurchase[]>(
		`
    SELECT p.*, i.name as item_name, pm.name as payment_method_name 
    FROM store_purchases p
    LEFT JOIN store_items i ON p.item_id = i.id
    LEFT JOIN store_payment_methods pm ON p.payment_method_id = pm.id
    WHERE p.id = ?
    `,
		[id],
	);
	return rows.length > 0 ? rows[0] : null;
}

export async function createPurchase(data: {
	minecraft_uuid: string;
	item_id: number;
	payment_method_id: number;
	discount_id?: number;
	status?: string;
	price_paid: number;
	transaction_id?: string;
}): Promise<number> {
	const {
		minecraft_uuid,
		item_id,
		payment_method_id,
		discount_id,
		status = "pending",
		price_paid,
		transaction_id,
	} = data;

	const [result] = await pool.execute(
		`
    INSERT INTO store_purchases (
      minecraft_uuid, 
      item_id, 
      payment_method_id, 
      discount_id, 
      status, 
      price_paid, 
      transaction_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
		[
			minecraft_uuid,
			item_id,
			payment_method_id,
			discount_id || null,
			status,
			price_paid,
			transaction_id || null,
		],
	);

	return (result as MySQLResult).insertId;
}

export async function updatePurchase(
	id: number,
	data: Partial<StorePurchase>,
): Promise<boolean> {
	const fields = Object.entries(data).filter(
		([key]) =>
			key !== "id" &&
			key !== "created_at" &&
			key !== "updated_at" &&
			key !== "item_name" &&
			key !== "payment_method_name",
	);

	if (fields.length === 0) return false;

	const setClause = fields.map(([key]) => `${key} = ?`).join(", ");
	const [result] = await pool.execute(
		`UPDATE store_purchases SET ${setClause}, updated_at = NOW() WHERE id = ?`,
		[...fields.map(([, value]) => value), id],
	);

	return (result as MySQLResult).affectedRows > 0;
}

export async function deletePurchase(id: number): Promise<boolean> {
	try {
		const [result] = await pool.execute(
			"DELETE FROM store_purchases WHERE id = ?",
			[id],
		);
		return (result as MySQLResult).affectedRows > 0;
	} catch (error) {
		console.error("Error deleting purchase:", error);
		return false;
	}
}
