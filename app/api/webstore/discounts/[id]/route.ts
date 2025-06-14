import { NextResponse } from "next/server";
import {
	getDiscountByCode,
	updateDiscount,
	deleteDiscount,
	ensureWebstoreTables,
} from "@/lib/database/webstore";
import { pool } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import type { RowDataPacket } from "mysql2";
import type { StoreDiscount } from "@/lib/database/webstore";

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

		// For GET requests, we don't need to check permission (public data)
		if (request.method === "GET") {
			return { authorized: true };
		}

		// For all other methods, check panel.store.admin permission
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

// Add a type definition for discount update data
type DiscountUpdateData = Partial<Omit<StoreDiscount, keyof RowDataPacket>>;

// GET a specific discount
export async function GET(
	request: Request,
	context: { params: Promise<{ id: string }> },
) {
	// Extract id from params at the beginning of the function
	const params = await context.params;
	const idParam = params.id;

	try {
		await ensureTables();

		// Parse id if it's a number
		const id = Number.parseInt(idParam);

		let discount = null;

		if (!Number.isNaN(id)) {
			// Get discount by ID
			const [rows] = await pool.execute<RowDataPacket[]>(
				"SELECT * FROM store_discounts WHERE id = ?",
				[id],
			);
			discount = rows.length > 0 ? rows[0] : null;
		} else {
			// Treat as code
			discount = await getDiscountByCode(idParam);
		}

		if (!discount) {
			return NextResponse.json(
				{ error: "Discount not found" },
				{ status: 404 },
			);
		}

		return NextResponse.json(discount);
	} catch (error) {
		console.error(`Error fetching discount ${idParam}:`, error);
		return NextResponse.json(
			{ error: "Failed to fetch discount" },
			{ status: 500 },
		);
	}
}

// PUT/PATCH update a discount
export async function PUT(
	request: Request,
	context: { params: Promise<{ id: string }> },
) {
	// Extract id from params at the beginning of the function
	const params = await context.params;
	const idParam = params.id;

	const permission = await checkPermission(request);
	if (!permission.authorized) {
		return permission.response;
	}

	try {
		const id = Number.parseInt(idParam);

		if (Number.isNaN(id)) {
			return NextResponse.json(
				{ error: "Invalid discount ID" },
				{ status: 400 },
			);
		}

		// Check if discount exists
		const [checkRows] = await pool.execute<RowDataPacket[]>(
			"SELECT * FROM store_discounts WHERE id = ?",
			[id],
		);

		if (checkRows.length === 0) {
			return NextResponse.json(
				{ error: "Discount not found" },
				{ status: 404 },
			);
		}

		const data = await request.json();

		// Validate percentage if provided
		if (data.percentage !== undefined) {
			const percentage = Number.parseInt(data.percentage);
			if (Number.isNaN(percentage) || percentage <= 0 || percentage > 100) {
				return NextResponse.json(
					{ error: "Percentage must be a number between 1 and 100" },
					{ status: 400 },
				);
			}
			data.percentage = percentage;
		}

		// Parse numeric values
		if (data.max_uses !== undefined) {
			data.max_uses =
				data.max_uses === null ? null : Number.parseInt(data.max_uses);
		}

		const success = await updateDiscount(id, data as DiscountUpdateData);

		if (!success) {
			return NextResponse.json(
				{ error: "No changes were made" },
				{ status: 400 },
			);
		}

		// Get updated discount
		const [rows] = await pool.execute<RowDataPacket[]>(
			"SELECT * FROM store_discounts WHERE id = ?",
			[id],
		);

		return NextResponse.json(rows[0]);
	} catch (error: unknown) {
		console.error(`Error updating discount ${idParam}:`, error);

		// Check for duplicate code error
		if (error instanceof Error && error.message.includes("ER_DUP_ENTRY")) {
			return NextResponse.json(
				{ error: "Discount code already exists" },
				{ status: 400 },
			);
		}

		return NextResponse.json(
			{ error: "Failed to update discount" },
			{ status: 500 },
		);
	}
}

// DELETE a discount
export async function DELETE(
	request: Request,
	context: { params: Promise<{ id: string }> },
) {
	// Extract id from params at the beginning of the function
	const params = await context.params;
	const idParam = params.id;

	const permission = await checkPermission(request);
	if (!permission.authorized) {
		return permission.response;
	}

	try {
		const id = Number.parseInt(idParam);

		if (Number.isNaN(id)) {
			return NextResponse.json(
				{ error: "Invalid discount ID" },
				{ status: 400 },
			);
		}

		// Check if discount exists
		const [checkRows] = await pool.execute<RowDataPacket[]>(
			"SELECT * FROM store_discounts WHERE id = ?",
			[id],
		);

		if (checkRows.length === 0) {
			return NextResponse.json(
				{ error: "Discount not found" },
				{ status: 404 },
			);
		}

		const success = await deleteDiscount(id);

		if (!success) {
			return NextResponse.json(
				{ error: "Failed to delete discount" },
				{ status: 500 },
			);
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error(`Error deleting discount ${idParam}:`, error);
		return NextResponse.json(
			{ error: "Failed to delete discount" },
			{ status: 500 },
		);
	}
}
