"use client";

import { Badge } from "@/components/ui/badge";
import { AvatarUpload } from "@/components/avatar-upload";
import type { UserProfile } from "@/types/user";
import { AdminActions } from "./admin-actions";

interface ProfileHeaderProps {
	username: string;
	isOwnProfile: boolean;
	userProfile?: UserProfile;
	onlineStatus?: {
		isOnlineWeb: boolean;
		isOnlineServer: boolean;
	};
}

export function ProfileHeader({
	username,
	isOwnProfile,
	userProfile,
	onlineStatus,
}: ProfileHeaderProps) {
	// Function to get the appropriate badge variant based on the rank
	const getRankVariant = (rank: string) => {
		const rankMap: Record<
			string,
			"default" | "secondary" | "destructive" | "outline"
		> = {
			harbinger: "destructive",
			genesis: "secondary",
			warmaster: "default",
			// Add more ranks as needed
		};

		return rankMap[rank.toLowerCase()] || "outline";
	};

	return (
		<div className="flex items-start justify-between mb-8">
			<div className="flex items-start gap-6">
				<AvatarUpload
					username={username}
					currentAvatarUrl={userProfile?.avatarUrl}
				/>
				<div>
					<h1 className="text-4xl font-bold">
						{isOwnProfile ? "My Profile" : `${username}'s Profile`}
					</h1>
					<div className="mt-2 flex items-center gap-2">
						{userProfile?.highestRank && (
							<Badge
								variant={getRankVariant(userProfile.highestRank)}
								className="text-sm capitalize font-medium"
							>
								{userProfile.highestRank}
							</Badge>
						)}
						{!userProfile?.highestRank && (
							<Badge variant="outline" className="text-sm">
								Loading...
							</Badge>
						)}
						<OnlineStatus type="web" isOnline={onlineStatus?.isOnlineWeb} />
						<OnlineStatus
							type="server"
							isOnline={onlineStatus?.isOnlineServer}
						/>
					</div>
					{userProfile?.permissionGroups &&
						userProfile.permissionGroups.length > 1 && (
							<div className="mt-2 text-xs text-muted-foreground">
								All Groups: {userProfile.permissionGroups.join(", ")}
							</div>
						)}
					{!isOwnProfile && (
						<div className="mt-4">
							<AdminActions username={username} />
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

function OnlineStatus({
	type,
	isOnline,
}: { type: "web" | "server"; isOnline?: boolean }) {
	return (
		<span className="flex items-center gap-2">
			<span
				className={`w-2 h-2 rounded-full ${isOnline ? "bg-green-500" : "bg-gray-500"}`}
			/>
			<span className="text-sm text-muted-foreground">
				{type === "web" ? "Website" : "Server"}
			</span>
		</span>
	);
}
