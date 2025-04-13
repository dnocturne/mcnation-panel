import { NextResponse } from "next/server";
import {
	getItems,
	createItem,
	ensureWebstoreTables,
	setItemPaymentMethods,
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

		// For all other methods, check panel.webstore permission
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

// GET all items (optionally filtered by category)
export async function GET(request: Request) {
	try {
		await ensureTables();

		const { searchParams } = new URL(request.url);
		const categoryId = searchParams.get("category");
		const showInactive = searchParams.get("showInactive") === "true";

		let items = [];
		if (categoryId) {
			const id = Number.parseInt(categoryId);
			if (!Number.isNaN(id)) {
				items = await getItems(!showInactive, id);
			} else {
				return NextResponse.json(
					{ error: "Invalid category ID" },
					{ status: 400 },
				);
			}
		} else {
			items = await getItems(!showInactive);
		}

		return NextResponse.json(items);
	} catch (error) {
		console.error("Error fetching items:", error);
		return NextResponse.json(
			{ error: "Failed to fetch items" },
			{ status: 500 },
		);
	}
}

// POST create new item
export async function POST(request: Request) {
	const permission = await checkPermission(request);
	if (!permission.authorized) {
		return permission.response;
	}

	try {
		const data = await request.json();

		if (!data.name || !data.price) {
			return NextResponse.json(
				{ error: "Item name and price are required" },
				{ status: 400 },
			);
		}

		// Parse numeric values
		if (data.price) data.price = Number.parseFloat(data.price);
		if (data.sale_price) data.sale_price = Number.parseFloat(data.sale_price);
		if (data.category_id) data.category_id = Number.parseInt(data.category_id);

		// Extract payment methods before creating the item
		const paymentMethodIds = Array.isArray(data.paymentMethodIds)
			? data.paymentMethodIds
			: [];
		// Create a new object without paymentMethodIds - using rest operator without naming the property
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { paymentMethodIds: _, ...itemData } = data;

		// Create the item
		const itemId = await createItem(itemData);

		// Associate payment methods with the item
		if (paymentMethodIds.length > 0) {
			await setItemPaymentMethods(itemId, paymentMethodIds);
		}

		return NextResponse.json({
			id: itemId,
			...itemData,
			paymentMethodIds,
		});
	} catch (error) {
		console.error("Error creating item:", error);
		return NextResponse.json(
			{ error: "Failed to create item" },
			{ status: 500 },
		);
	}
}
