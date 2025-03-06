"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface StaffMember {
	username: string;
	role: string;
	avatarUrl: string | null;
}

export default function StaffPage() {
	const { data, isLoading } = useQuery({
		queryKey: ["staff"],
		queryFn: async () => {
			const response = await fetch("/api/staff");
			if (!response.ok) throw new Error("Failed to fetch staff");
			return response.json();
		},
	});

	if (isLoading) {
		return <div className="container py-8">Loading...</div>;
	}

	const staffByRole = data.staffMembers.reduce(
		(acc: Record<string, StaffMember[]>, member: StaffMember) => {
			if (!acc[member.role]) {
				acc[member.role] = [];
			}
			acc[member.role].push(member);
			return acc;
		},
		{},
	);

	return (
		<div className="container py-8">
			<h1 className="text-4xl font-bold text-center mb-8">Staff Team</h1>

			<div className="grid gap-8">
				{data.roles
					.slice()
					.reverse()
					.map(
						(role: string) =>
							staffByRole[role] && (
								<Card key={role}>
									<CardHeader>
										<CardTitle className="capitalize text-2xl">
											{role}s
										</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
											{staffByRole[role].map((member: StaffMember) => (
												<div
													key={member.username}
													className="flex items-center gap-4 p-4 rounded-lg bg-secondary"
												>
													<Avatar className="h-12 w-12">
														{member.avatarUrl ? (
															<AvatarImage
																src={member.avatarUrl}
																alt={member.username}
															/>
														) : (
															<AvatarFallback>
																{member.username[0].toUpperCase()}
															</AvatarFallback>
														)}
													</Avatar>
													<div>
														<div className="font-semibold">
															{member.username}
														</div>
														<div className="text-sm text-muted-foreground capitalize">
															{member.role}
														</div>
													</div>
												</div>
											))}
										</div>
									</CardContent>
								</Card>
							),
					)}
			</div>
		</div>
	);
}
