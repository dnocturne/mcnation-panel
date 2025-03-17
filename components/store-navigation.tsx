"use client";

import Link from "next/link";
import { ShoppingBag, Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePermission } from "@/hooks/use-permissions";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

export function StoreNavigation() {
	const { data: hasAdminPermission } = usePermission("panel.webstore");
	const { data: session, status } = useSession();
	const [cartCount, setCartCount] = useState(0);

	// Check auth state from NextAuth
	const isLoggedIn = status === "authenticated";

	// Fetch cart count if authenticated
	useEffect(() => {
		if (isLoggedIn) {
			// Example - replace with actual cart API
			fetch("/api/webstore/cart/count")
				.then((res) => (res.ok ? res.json() : { count: 0 }))
				.then((data) => setCartCount(data.count))
				.catch(() => setCartCount(0));
		}
	}, [isLoggedIn]);

	return (
		<div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							asChild
							size="icon"
							className="rounded-full shadow-lg relative"
						>
							<Link href="/store" title="Go to Store">
								{cartCount > 0 && (
									<Badge
										variant="destructive"
										className="absolute -top-2 -right-2 z-10 h-5 w-5 flex items-center justify-center p-0"
									>
										{cartCount}
									</Badge>
								)}
								<ShoppingBag className="h-5 w-5" />
							</Link>
						</Button>
					</TooltipTrigger>
					<TooltipContent side="left">
						<p>
							Web Store{cartCount > 0 ? ` (${cartCount} items in cart)` : ""}
						</p>
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>

			{/* Show profile button if logged in */}
			{isLoggedIn && (
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								asChild
								size="icon"
								variant="secondary"
								className="rounded-full shadow-lg"
							>
								<Link href="/profile" title="My Profile">
									<User className="h-5 w-5" />
								</Link>
							</Button>
						</TooltipTrigger>
						<TooltipContent side="left">
							<p>
								My Profile{session?.user?.name ? ` (${session.user.name})` : ""}
							</p>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			)}

			{hasAdminPermission && (
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								asChild
								size="icon"
								variant="secondary"
								className="rounded-full shadow-lg"
							>
								<Link href="/admin/store/items" title="Store Admin">
									<Settings className="h-5 w-5" />
								</Link>
							</Button>
						</TooltipTrigger>
						<TooltipContent side="left">
							<p>Store Admin Panel</p>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			)}
		</div>
	);
}
