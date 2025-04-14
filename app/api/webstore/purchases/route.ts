import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import {
	ensureWebstoreTables,
	getPurchases,
	createPurchase,
} from "@/lib/database/webstore";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import type { RowDataPacket } from "mysql2";

// Initialize tables if needed first
async function ensureTables() {
	await ensureWebstoreTables();
}

// Check if user has webstore permission using NextAuth
async function checkPermission(
	request: Request,
): Promise<{ authorized: boolean; response?: NextResponse }> {
	try {
		// Log request method for auditing purposes
		console.log(`Processing ${request.method} request for permissions check`);

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

		// All purchase-related operations require panel.store.admin permission
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

// GET all purchases with pagination and filtering
export async function GET(request: Request) {
	const permission = await checkPermission(request);
	if (!permission.authorized) {
		return permission.response;
	}

	try {
		await ensureTables();

		// Parse search query parameters
		const { searchParams } = new URL(request.url);
		const page = Number.parseInt(searchParams.get("page") || "1");
		const limit = Number.parseInt(searchParams.get("limit") || "25");
		const minecraft_uuid = searchParams.get("minecraft_uuid");
		const item_id = searchParams.get("item_id")
			? Number.parseInt(searchParams.get("item_id") || "0")
			: undefined;
		const status = searchParams.get("status") || undefined;
		const payment_method = searchParams.get("payment_method")
			? Number.parseInt(searchParams.get("payment_method") || "0")
			: undefined;
		const fromDate = searchParams.get("from") || undefined;
		const toDate = searchParams.get("to") || undefined;

		// Get purchases using the new function
		const result = await getPurchases({
			minecraftUuid: minecraft_uuid || undefined,
			itemId: item_id,
			status,
			paymentMethodId: payment_method,
			page,
			limit,
			fromDate,
			toDate,
		});

		// Format the response
		return NextResponse.json({
			data: result.purchases,
			pagination: {
				page: result.page,
				limit: result.limit,
				totalRecords: result.total,
				totalPages: result.totalPages,
				hasNextPage: result.page < result.totalPages,
				hasPrevPage: result.page > 1,
			},
		});
	} catch (error) {
		console.error("Error fetching purchases:", error);
		return NextResponse.json(
			{ error: "Failed to fetch purchases" },
			{ status: 500 },
		);
	}
}

// POST create a new purchase record (usually called by frontend or webhook)
export async function POST(request: Request) {
	try {
		await ensureTables();

		const data = await request.json();

		// Validate required fields
		if (!data.minecraft_uuid) {
			return NextResponse.json(
				{ error: "Minecraft UUID is required" },
				{ status: 400 },
			);
		}

		if (!data.item_id) {
			return NextResponse.json(
				{ error: "Item ID is required" },
				{ status: 400 },
			);
		}

		if (!data.payment_method_id) {
			return NextResponse.json(
				{ error: "Payment method ID is required" },
				{ status: 400 },
			);
		}

		// Verify item exists
		const [itemRows] = await pool.execute<RowDataPacket[]>(
			"SELECT * FROM store_items WHERE id = ?",
			[data.item_id],
		);

		if (itemRows.length === 0) {
			return NextResponse.json({ error: "Item not found" }, { status: 400 });
		}

		// Verify payment method exists
		const [methodRows] = await pool.execute<RowDataPacket[]>(
			"SELECT * FROM store_payment_methods WHERE id = ?",
			[data.payment_method_id],
		);

		if (methodRows.length === 0) {
			return NextResponse.json(
				{ error: "Payment method not found" },
				{ status: 400 },
			);
		}

		// Check if discount code exists and is valid if provided
		let finalPrice = itemRows[0].price;
		let discountId = null;

		if (data.discount_code) {
			const [discountRows] = await pool.execute<RowDataPacket[]>(
				"SELECT * FROM store_discounts WHERE code = ? AND active = TRUE",
				[data.discount_code],
			);

			if (discountRows.length === 0) {
				return NextResponse.json(
					{ error: "Invalid discount code" },
					{ status: 400 },
				);
			}

			// Apply discount
			const discount = discountRows[0];
			discountId = discount.id;

			// Calculate discounted price
			finalPrice = itemRows[0].price * (1 - discount.percentage / 100);

			// Update discount usage count
			await pool.execute(
				"UPDATE store_discounts SET times_used = times_used + 1 WHERE id = ?",
				[discount.id],
			);
		}

		// Create the purchase using our new function
		const purchaseId = await createPurchase({
			minecraft_uuid: data.minecraft_uuid,
			item_id: data.item_id,
			payment_method_id: data.payment_method_id,
			discount_id: discountId,
			status: data.status || "pending",
			price_paid: finalPrice,
			transaction_id: data.transaction_id,
		});

		// Get the created purchase
		const [purchaseRows] = await pool.execute<RowDataPacket[]>(
			"SELECT * FROM store_purchases WHERE id = ?",
			[purchaseId],
		);

		// Return the created purchase
		return NextResponse.json({ ...purchaseRows[0], success: true });
	} catch (error) {
		console.error("Error creating purchase:", error);
		return NextResponse.json(
			{ error: "Failed to create purchase" },
			{ status: 500 },
		);
	}
}
