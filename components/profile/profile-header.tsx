"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AvatarUpload } from "@/components/avatar-upload"
import { UserProfile } from "@/types/user"

interface ProfileHeaderProps {
  username: string
  isOwnProfile: boolean
  userProfile?: UserProfile
  onlineStatus?: {
    isOnlineWeb: boolean
    isOnlineServer: boolean
  }
}

export function ProfileHeader({ username, isOwnProfile, userProfile, onlineStatus }: ProfileHeaderProps) {
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
            <Badge variant="outline" className="text-sm">
              {userProfile?.highestRank || "Loading..."}
            </Badge>
            <OnlineStatus type="web" isOnline={onlineStatus?.isOnlineWeb} />
            <OnlineStatus type="server" isOnline={onlineStatus?.isOnlineServer} />
          </div>
        </div>
      </div>
    </div>
  )
}

function OnlineStatus({ type, isOnline }: { type: "web" | "server", isOnline?: boolean }) {
  return (
    <span className="flex items-center gap-2">
      <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-500'}`} />
      <span className="text-sm text-muted-foreground">
        {type === "web" ? "Website" : "Server"}
      </span>
    </span>
  )
} 