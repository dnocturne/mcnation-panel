import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
	process.env.JWT_SECRET || "your-secret-key",
);

export async function authMiddleware(request: Request) {
	const token = request.headers.get("Authorization")?.split(" ")[1];

	if (!token) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		await jwtVerify(token, JWT_SECRET);
		return NextResponse.next();
	} catch (error) {
		console.error("JWT verification error:", error);
		return NextResponse.json({ error: "Invalid token" }, { status: 401 });
	}
}
