import type { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { handleApiError } from "@/lib/utils/error-handler";
import { ApiError, ErrorCode } from "@/lib/utils/error-handler";

// Sample data - replace with your actual data fetching logic
const SAMPLE_DISCOUNTS = [
	{
		id: 1,
		code: "SUMMER2023",
		percentage: 20,
		valid_from: "2023-06-01T00:00:00Z",
		valid_until: "2023-08-31T23:59:59Z",
		max_uses: 100,
		times_used: 45,
		active: true,
		created_at: "2023-05-15T12:00:00Z",
		updated_at: "2023-05-15T12:00:00Z",
	},
	{
		id: 2,
		code: "WELCOME10",
		percentage: 10,
		valid_from: "2023-01-01T00:00:00Z",
		valid_until: "2023-12-31T23:59:59Z",
		max_uses: 500,
		times_used: 210,
		active: true,
		created_at: "2023-01-01T10:00:00Z",
		updated_at: "2023-01-01T10:00:00Z",
	},
	{
		id: 3,
		code: "FLASH50",
		percentage: 50,
		valid_from: "2023-07-10T00:00:00Z",
		valid_until: "2023-07-12T23:59:59Z",
		max_uses: 50,
		times_used: 50,
		active: false,
		created_at: "2023-07-01T08:00:00Z",
		updated_at: "2023-07-12T23:59:59Z",
	},
];

/**
 * GET /api/webstore/discounts
 * Fetches all discount codes (admin only)
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(req: NextRequest) {
	// req parameter required by Next.js API route convention even if not used directly
	try {
		// Check authentication using NextAuth
		const session = await getServerSession(authOptions);

		if (!session?.user) {
			throw new ApiError(
				"Authentication required to access discount codes",
				ErrorCode.UNAUTHORIZED,
				401,
			);
		}

		// Check for admin role
		if (session.user.role !== "admin") {
			throw new ApiError(
				"Admin privileges required to access discount codes",
				ErrorCode.FORBIDDEN,
				403,
			);
		}

		// In a real app, fetch from database
		// const discounts = await prisma.discount.findMany()
		const discounts = SAMPLE_DISCOUNTS;

		return Response.json({ success: true, discounts });
	} catch (error) {
		return handleApiError(error, "Failed to fetch discount codes");
	}
}

/**
 * POST /api/webstore/discounts
 * Creates a new discount code (admin only)
 */
export async function POST(req: NextRequest) {
	try {
		// Check authentication using NextAuth
		const session = await getServerSession(authOptions);

		if (!session?.user) {
			throw new ApiError(
				"Authentication required to create discount codes",
				ErrorCode.UNAUTHORIZED,
				401,
			);
		}

		// Check for admin role
		if (session.user.role !== "admin") {
			throw new ApiError(
				"Admin privileges required to create discount codes",
				ErrorCode.FORBIDDEN,
				403,
			);
		}

		// Parse request body
		const discountData = await req.json();

		// In a real app, validate and create in database
		// const newDiscount = await prisma.discount.create({ data: discountData })

		// For now, just return the received data with a fake ID
		const newDiscount = {
			id: Math.floor(Math.random() * 1000) + 4,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
			...discountData,
		};

		return Response.json(
			{
				success: true,
				discount: newDiscount,
			},
			{ status: 201 },
		);
	} catch (error) {
		return handleApiError(error, "Failed to create discount code");
	}
}
