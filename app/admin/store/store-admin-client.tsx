"use client";

import { usePermission } from "@/hooks/use-permissions";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useAdminVerification } from "@/lib/context/admin-verification-context";
import { AdminVerificationModal } from "@/components/admin-verification-modal";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export function StoreAdminClient({ children }: { children: React.ReactNode }) {
	const { data: hasPermission, isLoading: permissionLoading } =
		usePermission("panel.store.admin");
	const { data: session, status } = useSession();
	const { isAdminVerified } = useAdminVerification();
	const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
	const [isNavigating, setIsNavigating] = useState(false);
	const router = useRouter();

	useEffect(() => {
		// Check if user is logged in
		if (status === "unauthenticated") {
			setIsNavigating(true);
			router.push(
				`/login?redirect=${encodeURIComponent(window.location.pathname)}`,
			);
			return;
		}

		// Check if user is an admin
		const isAdmin = session?.user?.role === "admin";
		if (status === "authenticated" && !isAdmin) {
			setIsNavigating(true);
			router.push("/");
			return;
		}

		// Check store permission
		if (!permissionLoading && hasPermission === false) {
			setIsNavigating(true);
			router.push("/admin");
			return;
		}

		// If authenticated but not admin-verified, show verification modal
		if (status === "authenticated" && isAdmin && !isAdminVerified) {
			setIsVerificationModalOpen(true);
		}
	}, [
		status,
		session,
		isAdminVerified,
		router,
		hasPermission,
		permissionLoading,
	]);

	// Prevent flashes of content during redirects
	if (isNavigating) {
		return <LoadingSpinner text="Redirecting..." />;
	}

	if (status === "loading" || permissionLoading) {
		return <LoadingSpinner text="Checking store permissions..." />;
	}

	if (hasPermission === false) {
		return <LoadingSpinner text="Access denied. Redirecting..." />;
	}

	return (
		<>
			{children}

			<AdminVerificationModal
				isOpen={isVerificationModalOpen}
				onClose={() => {
					setIsVerificationModalOpen(false);
					// Comment out the auto-redirect when verification modal is closed
					// Let users stay on the page if they want to try verifying again
					// if (!isAdminVerified) {
					// 	setIsNavigating(true);
					// 	router.push("/");
					// }
				}}
				onVerified={() => {
					// Continue showing the admin page without any redirection
					setIsVerificationModalOpen(false);
				}}
			/>
		</>
	);
}
