"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export function withAuth<P extends object>(Component: React.ComponentType<P>) {
	return function ProtectedRoute(props: P) {
		const [isMounted, setIsMounted] = useState(false);
		const { status } = useSession();
		const router = useRouter();

		useEffect(() => {
			setIsMounted(true);
		}, []);

		useEffect(() => {
			if (isMounted && status === "unauthenticated") {
				console.log("Redirecting to login from protected route");
				router.replace(
					`/login?redirect=${encodeURIComponent(window.location.pathname)}`,
				);
			}
		}, [isMounted, status, router]);

		if (!isMounted || status === "loading") {
			return (
				<div className="flex justify-center items-center h-48">
					<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
				</div>
			);
		}

		if (status === "unauthenticated") {
			return null; // User not authenticated
		}

		return <Component {...props} />;
	};
}
