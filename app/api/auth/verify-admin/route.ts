import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getLibreLoginUser } from "@/lib/database/librelogin";

export async function POST(request: Request) {
	try {
		// Get current session to verify the user is logged in
		const session = await getServerSession(authOptions);

		if (!session?.user?.name) {
			return NextResponse.json(
				{ error: "Unauthorized", success: false },
				{ status: 401 },
			);
		}

		// Only allow verification for admins
		if (session.user.role !== "admin") {
			return NextResponse.json(
				{ error: "Forbidden", success: false },
				{ status: 403 },
			);
		}

		// Get password from request
		const { password } = await request.json();
		if (!password) {
			return NextResponse.json(
				{ error: "Password is required", success: false },
				{ status: 400 },
			);
		}

		// Get user data from database
		const username = session.user.name;
		const user = await getLibreLoginUser(username);

		if (!user) {
			return NextResponse.json(
				{ error: "User not found", success: false },
				{ status: 404 },
			);
		}

		// The stored format is:
		// algo: BCrypt-2A
		// salt: stored separately
		// hashed_password: cost$hash
		const [cost, hash] = user.hashed_password.split("$");
		const bcryptHash = `$2a$${cost}$${user.salt}${hash}`;

		// Verify password
		const isValid = await bcrypt.compare(password, bcryptHash);

		if (!isValid) {
			return NextResponse.json(
				{ error: "Invalid password", success: false },
				{ status: 401 },
			);
		}

		// Password is valid
		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Admin verification error:", error);
		return NextResponse.json(
			{ error: "Internal server error", success: false },
			{ status: 500 },
		);
	}
}
