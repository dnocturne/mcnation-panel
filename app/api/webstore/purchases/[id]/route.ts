import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { ensureWebstoreTables } from "@/lib/database/webstore";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import type { RowDataPacket, ResultSetHeader } from "mysql2";

// Initialize tables if needed first
async function ensureTables() {
	await ensureWebstoreTables();
}

// Check if user has webstore permission using NextAuth
async function checkPermission(
	request: Request,
): Promise<{ authorized: boolean; response?: NextResponse }> {
	try {
		// Get session from NextAuth
		const session = await getServerSession(authOptions);

		if (!session?.user) {
			console.log("No authenticated user found in session");
			return {
				authorized: false,
				response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
			};
		}

		const username = session.user.name;

		if (!username) {
			console.log("Username missing in session:", session);
			return {
				authorized: false,
				response: NextResponse.json(
					{ error: "Invalid session" },
					{ status: 401 },
				),
			};
		}

		// For GET requests, we may apply different permission rules
		if (request.method === "GET") {
			// For now all methods require the same permission, but this demonstrates
			// that we're actually using the request parameter
			console.log(`Processing ${request.method} request`);
		}

		// All purchase-related operations require panel.webstore permission
		console.log(`Checking webstore permission for user ${username}`);
		const hasAccess = await hasPermission(username, "panel.store.admin");

		if (!hasAccess) {
			console.log(`User ${username} denied access to webstore admin`);
			return {
				authorized: false,
				response: NextResponse.json(
					{ error: "Access denied" },
					{ status: 403 },
				),
			};
		}

		return { authorized: true };
	} catch (error) {
		console.error("Error in permission check:", error);
		return {
			authorized: false,
			response: NextResponse.json(
				{ error: "Authentication error" },
				{ status: 500 },
			),
		};
	}
}

// GET a specific purchase
export async function GET(
	request: Request,
	{ params }: { params: { id: string } },
) {
	const permission = await checkPermission(request);
	if (!permission.authorized) {
		return permission.response;
	}

	try {
		await ensureTables();

		const id = Number.parseInt(params.id);
		if (Number.isNaN(id)) {
			return NextResponse.json(
				{ error: "Invalid purchase ID" },
				{ status: 400 },
			);
		}

		const [rows] = await pool.execute<RowDataPacket[]>(
			`SELECT p.*, i.name as item_name, pm.name as payment_method_name,
              d.code as discount_code, d.percentage as discount_percentage
       FROM store_purchases p
       LEFT JOIN store_items i ON p.item_id = i.id
       LEFT JOIN store_payment_methods pm ON p.payment_method_id = pm.id
       LEFT JOIN store_discounts d ON p.discount_id = d.id
       WHERE p.id = ?`,
			[id],
		);

		if (rows.length === 0) {
			return NextResponse.json(
				{ error: "Purchase not found" },
				{ status: 404 },
			);
		}

		return NextResponse.json(rows[0]);
	} catch (error) {
		console.error(`Error fetching purchase ${params.id}:`, error);
		return NextResponse.json(
			{ error: "Failed to fetch purchase" },
			{ status: 500 },
		);
	}
}

// PUT/PATCH update a purchase
export async function PUT(
	request: Request,
	{ params }: { params: { id: string } },
) {
	const permission = await checkPermission(request);
	if (!permission.authorized) {
		return permission.response;
	}

	try {
		const id = Number.parseInt(params.id);
		if (Number.isNaN(id)) {
			return NextResponse.json(
				{ error: "Invalid purchase ID" },
				{ status: 400 },
			);
		}

		// Check if purchase exists
		const [checkRows] = await pool.execute<RowDataPacket[]>(
			"SELECT * FROM store_purchases WHERE id = ?",
			[id],
		);

		if (checkRows.length === 0) {
			return NextResponse.json(
				{ error: "Purchase not found" },
				{ status: 404 },
			);
		}

		const data = await request.json();

		// Build the update query based on provided fields
		const updateFields = [];
		const updateValues = [];

		// Only allow certain fields to be updated
		if (data.status !== undefined) {
			updateFields.push("status = ?");
			updateValues.push(data.status);
		}

		if (data.transaction_id !== undefined) {
			updateFields.push("transaction_id = ?");
			updateValues.push(data.transaction_id);
		}

		if (data.notes !== undefined) {
			updateFields.push("notes = ?");
			updateValues.push(data.notes);
		}

		if (data.delivered !== undefined) {
			updateFields.push("delivered = ?");
			updateValues.push(!!data.delivered);
		}

		if (data.delivered_at !== undefined) {
			updateFields.push("delivered_at = ?");
			updateValues.push(data.delivered_at);
		}

		if (updateFields.length === 0) {
			return NextResponse.json(
				{ error: "No fields to update" },
				{ status: 400 },
			);
		}

		// Add the ID as the last parameter
		updateValues.push(id);

		const query = `
      UPDATE store_purchases 
      SET ${updateFields.join(", ")} 
      WHERE id = ?
    `;

		const [result] = await pool.execute(query, updateValues);

		if ((result as ResultSetHeader).affectedRows === 0) {
			return NextResponse.json(
				{ error: "No changes were made" },
				{ status: 400 },
			);
		}

		// Get updated purchase
		const [rows] = await pool.execute<RowDataPacket[]>(
			`SELECT p.*, i.name as item_name, pm.name as payment_method_name,
              d.code as discount_code, d.percentage as discount_percentage
       FROM store_purchases p
       LEFT JOIN store_items i ON p.item_id = i.id
       LEFT JOIN store_payment_methods pm ON p.payment_method_id = pm.id
       LEFT JOIN store_discounts d ON p.discount_id = d.id
       WHERE p.id = ?`,
			[id],
		);

		return NextResponse.json(rows[0]);
	} catch (error) {
		console.error(`Error updating purchase ${params.id}:`, error);
		return NextResponse.json(
			{ error: "Failed to update purchase" },
			{ status: 500 },
		);
	}
}

// DELETE a purchase record
export async function DELETE(
	request: Request,
	{ params }: { params: { id: string } },
) {
	const permission = await checkPermission(request);
	if (!permission.authorized) {
		return permission.response;
	}

	try {
		const id = Number.parseInt(params.id);
		if (Number.isNaN(id)) {
			return NextResponse.json(
				{ error: "Invalid purchase ID" },
				{ status: 400 },
			);
		}

		// Check if purchase exists
		const [checkRows] = await pool.execute<RowDataPacket[]>(
			"SELECT * FROM store_purchases WHERE id = ?",
			[id],
		);

		if (checkRows.length === 0) {
			return NextResponse.json(
				{ error: "Purchase not found" },
				{ status: 404 },
			);
		}

		// Admin note: Deleting purchase records may affect reporting, consider soft deletes
		const [result] = await pool.execute(
			"DELETE FROM store_purchases WHERE id = ?",
			[id],
		);

		if ((result as ResultSetHeader).affectedRows === 0) {
			return NextResponse.json(
				{ error: "Failed to delete purchase" },
				{ status: 500 },
			);
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error(`Error deleting purchase ${params.id}:`, error);
		return NextResponse.json(
			{ error: "Failed to delete purchase" },
			{ status: 500 },
		);
	}
}
