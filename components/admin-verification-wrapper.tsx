"use client";

import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AdminVerificationModal } from "./admin-verification-modal";
import { useAdminVerification } from "@/lib/context/admin-verification-context";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface AdminVerificationWrapperProps {
	children: ReactNode;
}

export function AdminVerificationWrapper({
	children,
}: AdminVerificationWrapperProps) {
	const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
	const [isChecking, setIsChecking] = useState(true);
	const { data: session, status } = useSession();
	const router = useRouter();
	const { isAdminVerified } = useAdminVerification();

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

		// If authenticated but not admin-verified, show verification modal
		if (status === "authenticated" && isAdmin && !isAdminVerified) {
			setIsVerificationModalOpen(true);
		}

		setIsChecking(false);
	}, [status, session, isAdminVerified, router]);

	if (isChecking) {
		return <LoadingSpinner text="Checking permissions..." />;
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
