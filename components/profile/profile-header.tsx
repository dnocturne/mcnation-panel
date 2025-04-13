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
	// Function to get the appropriate badge display
	const getRankDisplay = (rank: string) => {
		// Transform ranks if needed
		const displayNameMap: Record<string, string> = {
			aod: "Architect of Doom",
		};

		return displayNameMap[rank.toLowerCase()] || rank;
	};

	// Function to get the custom style for the rank badge
	const getRankStyle = (rank: string) => {
		const rankStyles: Record<string, React.CSSProperties> = {
			aod: { backgroundColor: "#7332c8", color: "white" },
			harbinger: { backgroundColor: "#ff0000", color: "white" },
			reaper: { backgroundColor: "#c58518", color: "white" },
			shadow: { backgroundColor: "#e7dc0a", color: "black" },
			specter: { backgroundColor: "#fccd00", color: "black" },
		};

		return rankStyles[rank.toLowerCase()] || {};
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
								variant="outline"
								className="text-sm capitalize font-medium"
								style={getRankStyle(userProfile.highestRank)}
							>
								{getRankDisplay(userProfile.highestRank)}
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
