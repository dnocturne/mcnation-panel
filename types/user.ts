export interface UserProfile {
  username: string
  isOnlineServer: boolean
  isOperator: boolean
  mobKills: number
  permissionGroups: string[]
  playtime: string
  highestRank: string
  isOnlineWeb: boolean
  firstJoinDate: string
  lastSeenDate: string
  avatarUrl?: string
}

export interface PunishmentStats {
  type: "bans" | "mutes" | "warns" | "kicks"
  total: number
  active: number
} 