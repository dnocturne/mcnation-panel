"use client";

import * as React from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Moon, Sun, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect } from "react";
import fs from "node:fs";
import { useQuery } from "@tanstack/react-query";
import { usePermission } from "@/hooks/use-permissions";

import { cn } from "@/lib/utils";
import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
	navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function NavigationMenuDemo() {
	const { data: session, status } = useSession();
	const username = session?.user?.name;
	const { setTheme, theme } = useTheme();
	const router = useRouter();
	const { data: hasDashboardAccess, isLoading } =
		usePermission("panel.dashboard");

	const { data: avatarData } = useQuery({
		queryKey: ["avatar", username],
		queryFn: async () => {
			if (!username) return null;
			const response = await fetch(`/api/users/${username}/avatar`);
			if (!response.ok) throw new Error("Failed to fetch avatar");
			return response.json();
		},
		enabled: !!username,
	});

	const handleLoginRedirect = () => {
		router.push("/login");
	};

	const handleLogout = async () => {
		await signOut({ redirect: false });
		router.push("/login");
	};

	return (
		<div className="fixed top-0 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
			<div className="container h-14 max-w-screen-2xl mx-auto px-4">
				<div className="flex h-full items-center justify-between">
					<NavigationMenu>
						<NavigationMenuList>
							<NavigationMenuItem>
								<Link href="/" legacyBehavior passHref>
									<NavigationMenuLink className={navigationMenuTriggerStyle()}>
										Home
									</NavigationMenuLink>
								</Link>
							</NavigationMenuItem>
							{!isLoading && hasDashboardAccess && (
								<NavigationMenuItem>
									<NavigationMenuTrigger>Admin</NavigationMenuTrigger>
									<NavigationMenuContent>
										<ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px]">
											<ListItem href="/admin" title="Dashboard">
												Server management dashboard
											</ListItem>
											<ListItem href="/admin/rest" title="API Config">
												Configure REST API connection settings
											</ListItem>
										</ul>
									</NavigationMenuContent>
								</NavigationMenuItem>
							)}
							<NavigationMenuItem>
								<Link href="/punishments" legacyBehavior passHref>
									<NavigationMenuLink className={navigationMenuTriggerStyle()}>
										Punishments
									</NavigationMenuLink>
								</Link>
							</NavigationMenuItem>
							<NavigationMenuItem>
								<NavigationMenuLink
									href="/teams"
									className={navigationMenuTriggerStyle()}
								>
									Our Team
								</NavigationMenuLink>
							</NavigationMenuItem>
						</NavigationMenuList>
					</NavigationMenu>

					<div className="flex items-center space-x-4">
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										variant="outline"
										size="icon"
										className="h-8 w-8"
										onClick={() =>
											setTheme(theme === "dark" ? "light" : "dark")
										}
									>
										<Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
										<Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
										<span className="sr-only">Toggle theme</span>
									</Button>
								</TooltipTrigger>
								<TooltipContent>
									<p>Toggle theme</p>
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>

						{status === "authenticated" && username ? (
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant="ghost"
										className="relative h-8 w-8 rounded-full"
									>
										<Avatar className="h-8 w-8">
											<AvatarImage src={avatarData?.avatarUrl} alt={username} />
											<AvatarFallback>{username[0]}</AvatarFallback>
										</Avatar>
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent className="w-56" align="end" forceMount>
									<DropdownMenuLabel className="font-normal">
										<div className="flex flex-col space-y-1">
											<p className="text-sm font-medium leading-none">
												{username}
											</p>
										</div>
									</DropdownMenuLabel>
									<DropdownMenuSeparator />
									<DropdownMenuItem
										className="cursor-pointer"
										onClick={() => router.push(`/profile/${username}`)}
									>
										Profile
									</DropdownMenuItem>
									<DropdownMenuItem
										className="cursor-pointer"
										onClick={handleLogout}
									>
										Logout
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						) : (
							<Button
								variant="outline"
								onClick={handleLoginRedirect}
								className="h-8"
							>
								Login
							</Button>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

const ListItem = React.forwardRef<
	React.ElementRef<"a">,
	React.ComponentPropsWithoutRef<"a"> & { title: string }
>(({ className, title, children, href, ...props }, ref) => {
	return (
		<li>
			<NavigationMenuLink asChild>
				<a
					ref={ref}
					href={href}
					className={cn(
						"block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
						className,
					)}
					{...props}
				>
					<div className="text-sm font-medium leading-none">{title}</div>
					<p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
						{children}
					</p>
				</a>
			</NavigationMenuLink>
		</li>
	);
});
ListItem.displayName = "ListItem";
