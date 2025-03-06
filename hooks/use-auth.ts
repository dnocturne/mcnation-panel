"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useAdminVerification } from "@/lib/context/admin-verification-context";

/**
 * Custom hook for authentication operations
 * Combines NextAuth session with admin verification
 */
export function useAuth() {
	const { data: session, status } = useSession();
	const { isAdminVerified, setAdminVerified, resetVerification } =
		useAdminVerification();
	const router = useRouter();

	const isLoading = status === "loading";
	const isAuthenticated = status === "authenticated";
	const isAdmin = isAuthenticated && session?.user?.role === "admin";

	/**
	 * Handle user login
	 */
	const login = async (
		username: string,
		password: string,
		redirectPath: string,
	) => {
		const result = await signIn("credentials", {
			username,
			password,
			redirect: false,
			callbackUrl: redirectPath,
		});

		if (result?.error) {
			return { success: false, error: "Invalid username or password" };
		}

		router.push(redirectPath);
		router.refresh();

		return { success: true };
	};

	/**
	 * Handle user logout
	 */
	const logout = async (redirectPath = "/login") => {
		resetVerification();
		await signOut({ redirect: false });
		router.push(redirectPath);
	};

	/**
	 * Verify admin password for sensitive operations
	 */
	const verifyAdminPassword = async (password: string) => {
		// The username is taken from the current session
		const username = session?.user?.name;

		if (!username) {
			return { success: false, error: "No active session" };
		}

		const result = await signIn("credentials", {
			username,
			password,
			redirect: false,
		});

		if (result?.error) {
			return { success: false, error: "Password verification failed" };
		}

		setAdminVerified(true);
		return { success: true };
	};

	return {
		user: session?.user,
		isLoading,
		isAuthenticated,
		isAdmin,
		isAdminVerified,
		login,
		logout,
		verifyAdminPassword,
	};
}
