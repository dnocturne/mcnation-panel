import { pool } from "@/lib/db";

export async function runMigrations() {
	console.log("Running database migrations...");

	try {
		// Check if on_sale column exists in store_items table
		await addOnSaleColumnToStoreItems();

		console.log("Migrations completed successfully");
	} catch (error) {
		console.error("Error running migrations:", error);
	}
}

async function addOnSaleColumnToStoreItems() {
	const connection = await pool.getConnection();

	try {
		// Check if the column exists
		const [columns] = await connection.execute(`
      SHOW COLUMNS FROM store_items LIKE 'on_sale'
    `);

		// @ts-expect-error - MySQL2 typing issue
		if (columns.length === 0) {
			console.log("Adding on_sale column to store_items table...");

			// Add the column
			await connection.execute(`
        ALTER TABLE store_items 
        ADD COLUMN on_sale BOOLEAN NOT NULL DEFAULT FALSE
      `);

			// Default any items with a sale_price to have on_sale=true to maintain current behavior
			await connection.execute(`
        UPDATE store_items 
        SET on_sale = TRUE 
        WHERE sale_price IS NOT NULL AND sale_price > 0
      `);

			console.log("on_sale column added successfully");
		} else {
			console.log("on_sale column already exists in store_items table");
		}
	} finally {
		connection.release();
	}
}
