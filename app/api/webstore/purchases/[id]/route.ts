import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import {
	ensureWebstoreTables,
	getPurchaseById,
	updatePurchase,
	deletePurchase,
} from "@/lib/database/webstore";
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
		await ensureTables();

		const id = Number.parseInt(idParam);
		if (Number.isNaN(id)) {
			return NextResponse.json(
				{ error: "Invalid purchase ID" },
				{ status: 400 },
			);
		}

		const purchase = await getPurchaseById(id);

		if (!purchase) {
			return NextResponse.json(
				{ error: "Purchase not found" },
				{ status: 404 },
			);
		}

		return NextResponse.json(purchase);
	} catch (error) {
		console.error(`Error fetching purchase ${idParam}:`, error);
		return NextResponse.json(
			{ error: "Failed to fetch purchase" },
			{ status: 500 },
		);
	}
}

// PUT/PATCH update a purchase
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
				{ error: "Invalid purchase ID" },
				{ status: 400 },
			);
		}

		// Check if purchase exists
		const purchase = await getPurchaseById(id);
		if (!purchase) {
			return NextResponse.json(
				{ error: "Purchase not found" },
				{ status: 404 },
			);
		}

		const data = await request.json();

		// Only allow certain fields to be updated
		const updateData: any = {
			...(data.status !== undefined && { status: data.status }),
			...(data.transaction_id !== undefined && {
				transaction_id: data.transaction_id,
			}),
			...(data.notes !== undefined && { notes: data.notes }),
			...(data.delivered !== undefined && { delivered: !!data.delivered }),
			...(data.delivered_at !== undefined && {
				delivered_at: data.delivered_at,
			}),
		};

		if (Object.keys(updateData).length === 0) {
			return NextResponse.json(
				{ error: "No fields to update" },
				{ status: 400 },
			);
		}

		const success = await updatePurchase(id, updateData);

		if (!success) {
			return NextResponse.json(
				{ error: "No changes were made" },
				{ status: 400 },
			);
		}

		// Get updated purchase
		const updatedPurchase = await getPurchaseById(id);

		return NextResponse.json(updatedPurchase);
	} catch (error) {
		console.error(`Error updating purchase ${idParam}:`, error);
		return NextResponse.json(
			{ error: "Failed to update purchase" },
			{ status: 500 },
		);
	}
}

// DELETE a purchase record
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
				{ error: "Invalid purchase ID" },
				{ status: 400 },
			);
		}

		// Check if purchase exists
		const purchase = await getPurchaseById(id);
		if (!purchase) {
			return NextResponse.json(
				{ error: "Purchase not found" },
				{ status: 404 },
			);
		}

		const success = await deletePurchase(id);

		if (!success) {
			return NextResponse.json(
				{ error: "Failed to delete purchase" },
				{ status: 500 },
			);
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error(`Error deleting purchase ${idParam}:`, error);
		return NextResponse.json(
			{ error: "Failed to delete purchase" },
			{ status: 500 },
		);
	}
}
