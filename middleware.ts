import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	// Check if the path is a protected route
	const isProtectedRoute =
		pathname.startsWith("/admin") ||
		pathname.startsWith("/api/admin") ||
		pathname.startsWith("/api/webstore/discounts");

	// Allow public routes and API routes that handle their own auth
	if (!isProtectedRoute) {
		return NextResponse.next();
	}

	// Get the session token
	const token = await getToken({
		req: request,
		secret: process.env.NEXTAUTH_SECRET,
	});

	// If no token or not an admin, redirect to login
	if (!token || (isProtectedRoute && token.role !== "admin")) {
		// Store the current URL to redirect back after login
		const url = new URL("/auth/login", request.url);
		url.searchParams.set("redirect", encodeURI(pathname));

		return NextResponse.redirect(url);
	}

	return NextResponse.next();
}

// Match only the routes we want to protect
export const config = {
	matcher: [
		"/admin/:path*",
		"/api/admin/:path*",
		"/api/webstore/discounts/:path*",
	],
};
