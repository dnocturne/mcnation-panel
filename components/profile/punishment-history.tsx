"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PunishmentsTable } from "@/components/punishments-table"
import { useState } from "react"

type PunishmentType = "bans" | "mutes" | "warns" | "kicks"

interface PunishmentHistoryProps {
  username: string
  isOwnProfile: boolean
}

export function PunishmentHistory({ username, isOwnProfile }: PunishmentHistoryProps) {
  const [punishmentType, setPunishmentType] = useState<PunishmentType>("bans")

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isOwnProfile ? "My Punishment History" : "Punishment History"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Tabs value={punishmentType} onValueChange={(v) => setPunishmentType(v as PunishmentType)}>
            <TabsList>
              <TabsTrigger value="bans">Bans</TabsTrigger>
              <TabsTrigger value="mutes">Mutes</TabsTrigger>
              <TabsTrigger value="warns">Warns</TabsTrigger>
              <TabsTrigger value="kicks">Kicks</TabsTrigger>
            </TabsList>
          </Tabs>

          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="expired">Expired</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <PunishmentsTable type={punishmentType} playerFilter={username} />
            </TabsContent>
            <TabsContent value="active">
              <PunishmentsTable type={punishmentType} playerFilter={username} activeOnly />
            </TabsContent>
            <TabsContent value="expired">
              <PunishmentsTable type={punishmentType} playerFilter={username} expiredOnly />
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  )
} 