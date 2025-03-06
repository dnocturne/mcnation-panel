"use client";

import { useSession } from "next-auth/react";
import { NavigationMenuDemo } from "@/components/navbar";
import { useParams } from "next/navigation";
import { useQuery, useQueries } from "@tanstack/react-query";
import { ProfileHeader } from "@/components/profile/profile-header";
import { PunishmentHistory } from "@/components/profile/punishment-history";
import type { UserProfile } from "@/types/user";
import { GameplayStats } from "@/components/profile/gameplay-stats";
import { SkinViewer } from "@/components/profile/skin-viewer";

export default function ProfilePage() {
	const params = useParams();
	const username = params.username as string;
	const { data: session } = useSession();
	const loggedInUser = session?.user?.name;
	const isOwnProfile = username === loggedInUser;

	const { data: userProfile, isLoading: profileLoading } =
		useQuery<UserProfile>({
			queryKey: ["userProfile", username],
			queryFn: async () => {
				const response = await fetch(`/api/users/${username}/profile`);
				if (!response.ok) throw new Error("Failed to fetch profile");
				return response.json();
			},
		});

	const { data: onlineStatus } = useQuery({
		queryKey: ["onlineStatus", username],
		queryFn: async () => {
			const response = await fetch(`/api/users/${username}/online`);
			if (!response.ok) throw new Error("Failed to fetch online status");
			return response.json();
		},
		refetchInterval: 30000,
	});

	return (
		<div className="min-h-screen bg-background">
			<NavigationMenuDemo />
			<div className="container mx-auto py-8 px-4 mt-14">
				<ProfileHeader
					username={username}
					isOwnProfile={isOwnProfile}
					userProfile={userProfile}
					onlineStatus={onlineStatus}
				/>

				<div className="grid grid-cols-12 gap-6">
					<div className="col-span-12 md:col-span-4">
						<GameplayStats userProfile={userProfile} />
						<div className="mt-6">
							<SkinViewer username={username} />
						</div>
					</div>
					<div className="col-span-12 md:col-span-8">
						<PunishmentHistory
							username={username}
							isOwnProfile={isOwnProfile}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
