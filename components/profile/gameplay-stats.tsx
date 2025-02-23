"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserProfile } from "@/types/user"
import { Clock, Sword, Calendar, History } from "lucide-react"
import { format } from "date-fns"

interface GameplayStatsProps {
  userProfile?: UserProfile
}

export function GameplayStats({ userProfile }: GameplayStatsProps) {
  // Format playtime from minutes to readable format
  const formatPlaytime = (minutes: string) => {
    const mins = parseInt(minutes)
    const days = Math.floor(mins / (60 * 24))
    const hours = Math.floor((mins % (60 * 24)) / 60)
    const remainingMins = mins % 60

    return `${days}d ${hours}h ${remainingMins}m`
  }

  const formatDate = (dateString: string) => {
    if (dateString === 'Unknown') return 'Unknown'
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm')
    } catch {
      return 'Unknown'
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Player Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  <p className="text-sm font-medium">Total Playtime</p>
                </div>
                <p className="text-2xl font-bold">
                  {userProfile ? formatPlaytime(userProfile.playtime) : "Unknown"}
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Sword className="w-5 h-5 text-primary" />
                  <p className="text-sm font-medium">Mob Kills</p>
                </div>
                <p className="text-2xl font-bold">
                  {userProfile?.mobKills ?? "Unknown"}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  <p className="text-sm font-medium">First Join</p>
                </div>
                <p className="text-base font-medium">
                  {userProfile ? formatDate(userProfile.firstJoinDate) : "Unknown"}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-primary" />
                  <p className="text-sm font-medium">Last Seen</p>
                </div>
                <p className="text-base font-medium">
                  {userProfile ? formatDate(userProfile.lastSeenDate) : "Unknown"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 