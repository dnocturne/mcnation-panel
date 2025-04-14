import { NextResponse } from "next/server";
import {
	getItemById,
	updateItem,
	deleteItem,
	getItemPaymentMethods,
	setItemPaymentMethods,
	ensureWebstoreTables,
} from "@/lib/database/webstore";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";

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

// GET a specific item
export async function GET(
	request: Request,
	context: { params: Promise<{ id: string }> },
) {
	// Extract id from params at the beginning of the function
	const params = await context.params;
	const idParam = params.id;

	try {
		await ensureTables();

		const id = Number.parseInt(idParam);
		if (Number.isNaN(id)) {
			return NextResponse.json({ error: "Invalid item ID" }, { status: 400 });
		}

		const item = await getItemById(id);
		if (!item) {
			return NextResponse.json({ error: "Item not found" }, { status: 404 });
		}

		// Get payment methods for this item
		const paymentMethods = await getItemPaymentMethods(id);

		return NextResponse.json({
			...item,
			paymentMethods,
		});
	} catch (error) {
		console.error(`Error fetching item ${idParam}:`, error);
		return NextResponse.json(
			{ error: "Failed to fetch item" },
			{ status: 500 },
		);
	}
}

// PUT/PATCH update an item
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
			return NextResponse.json({ error: "Invalid item ID" }, { status: 400 });
		}

		const item = await getItemById(id);
		if (!item) {
			return NextResponse.json({ error: "Item not found" }, { status: 404 });
		}

		const data = await request.json();

		// Parse numeric values
		if (data.price) data.price = Number.parseFloat(data.price);
		if (data.sale_price) data.sale_price = Number.parseFloat(data.sale_price);
		if (data.category_id) data.category_id = Number.parseInt(data.category_id);

		// Extract payment methods if provided
		const { paymentMethodIds, ...dataToUpdate } = data;

		const success = await updateItem(id, dataToUpdate);

		// Update payment methods if provided
		if (paymentMethodIds && Array.isArray(paymentMethodIds)) {
			await setItemPaymentMethods(id, paymentMethodIds);
		}

		if (!success && !paymentMethodIds) {
			return NextResponse.json(
				{ error: "No changes were made" },
				{ status: 400 },
			);
		}

		const updatedItem = await getItemById(id);
		const updatedPaymentMethods = await getItemPaymentMethods(id);

		return NextResponse.json({
			...updatedItem,
			paymentMethods: updatedPaymentMethods,
		});
	} catch (error) {
		console.error(`Error updating item ${idParam}:`, error);
		return NextResponse.json(
			{ error: "Failed to update item" },
			{ status: 500 },
		);
	}
}

// DELETE an item
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
			return NextResponse.json({ error: "Invalid item ID" }, { status: 400 });
		}

		const item = await getItemById(id);
		if (!item) {
			return NextResponse.json({ error: "Item not found" }, { status: 404 });
		}

		const success = await deleteItem(id);

		if (!success) {
			return NextResponse.json(
				{ error: "Failed to delete item" },
				{ status: 500 },
			);
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error(`Error deleting item ${idParam}:`, error);
		return NextResponse.json(
			{ error: "Failed to delete item" },
			{ status: 500 },
		);
	}
}
