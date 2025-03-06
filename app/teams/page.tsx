"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { NavigationMenuDemo } from "@/components/navbar";

interface TeamMember {
	username: string;
	role: string;
	avatarUrl: string | null;
}

export default function TeamsPage() {
	const { data, isLoading } = useQuery({
		queryKey: ["teams"],
		queryFn: async () => {
			const response = await fetch("/api/teams");
			if (!response.ok) throw new Error("Failed to fetch teams");
			return response.json();
		},
	});

	if (isLoading) {
		return (
			<>
				<NavigationMenuDemo />
				<div className="container py-12 mt-14">
					<Skeleton className="h-8 w-48 mx-auto mb-8" />
					<div className="grid gap-8">
						<div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
							<Skeleton key="skeleton-1-1" className="h-24 w-full" />
							<Skeleton key="skeleton-1-2" className="h-24 w-full" />
							<Skeleton key="skeleton-1-3" className="h-24 w-full" />
							<Skeleton key="skeleton-1-4" className="h-24 w-full" />
						</div>
						<div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
							<Skeleton key="skeleton-2-1" className="h-24 w-full" />
							<Skeleton key="skeleton-2-2" className="h-24 w-full" />
							<Skeleton key="skeleton-2-3" className="h-24 w-full" />
							<Skeleton key="skeleton-2-4" className="h-24 w-full" />
						</div>
						<div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
							<Skeleton key="skeleton-3-1" className="h-24 w-full" />
							<Skeleton key="skeleton-3-2" className="h-24 w-full" />
							<Skeleton key="skeleton-3-3" className="h-24 w-full" />
							<Skeleton key="skeleton-3-4" className="h-24 w-full" />
						</div>
					</div>
				</div>
			</>
		);
	}

	// Flatten all members into a single array with their roles
	const allMembers = Object.entries(
		data.teamByRole as Record<string, TeamMember[]>,
	).flatMap(([role, members]) =>
		members.map((member) => ({
			...member,
			role,
		})),
	);

	// Sort by role hierarchy (using the roles array) and then by username
	const sortedMembers = allMembers.sort((a, b) => {
		const roleComparison =
			data.roles.indexOf(b.role) - data.roles.indexOf(a.role);
		return roleComparison !== 0
			? roleComparison
			: a.username.localeCompare(b.username);
	});

	return (
		<>
			<NavigationMenuDemo />
			<div className="container py-12 mt-14">
				<h1 className="text-4xl font-bold text-center mb-12">Our Team</h1>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
					{sortedMembers.map((member) => (
						<Card key={member.username} className="overflow-hidden">
							<CardContent className="p-6">
								<div className="flex flex-col items-center text-center space-y-4">
									<Avatar className="h-24 w-24">
										{member.avatarUrl ? (
											<AvatarImage
												src={member.avatarUrl}
												alt={member.username}
											/>
										) : (
											<AvatarFallback className="text-xl">
												{member.username[0].toUpperCase()}
											</AvatarFallback>
										)}
									</Avatar>
									<div>
										<div className="font-semibold text-lg">
											{member.username}
										</div>
										<div className="text-sm text-muted-foreground capitalize">
											{member.role}
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		</>
	);
}
