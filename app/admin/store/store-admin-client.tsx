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
	const router = useRouter();

	useEffect(() => {
		// Check if user is logged in
		if (status === "unauthenticated") {
			router.push(
				`/login?redirect=${encodeURIComponent(window.location.pathname)}`,
			);
			return;
		}

		// Check if user is an admin
		const isAdmin = session?.user?.role === "admin";
		if (status === "authenticated" && !isAdmin) {
			router.push("/");
			return;
		}

		// Check store permission
		if (!permissionLoading && hasPermission === false) {
			router.push("/admin");
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
					// If user cancels verification, redirect back to main page
					if (!isAdminVerified) {
						router.push("/");
					}
				}}
				onVerified={() => {
					// Continue showing the admin page
					setIsVerificationModalOpen(false);
				}}
			/>
		</>
	);
}
