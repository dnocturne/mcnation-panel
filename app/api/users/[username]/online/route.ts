import { NextResponse } from "next/server"
import { pool } from "@/lib/db"
import { RowDataPacket } from "mysql2"
import { getServerSession } from "next-auth"
import { onlineUsersStore } from "@/lib/online-users-store"
import { authOptions } from "@/lib/auth"

export async function GET(
  request: Request,
  { params }: { params: { username: string } }
) {
  const { username } = params
  
  // Get the NextAuth session
  const session = await getServerSession(authOptions)
  
  // Update last activity if user is authenticated
  if (session?.user?.name) {
    onlineUsersStore.updateActivity(session.user.name)
  }

  try {
    const query = `
      SELECT 
        online as isOnlineServer
      FROM PlayerData 
      WHERE username = ?
    `
    const [rows] = await pool.execute<RowDataPacket[]>(query, [username])
    
    return NextResponse.json({
      isOnlineServer: Boolean(rows[0]?.isOnlineServer),
      isOnlineWeb: onlineUsersStore.isUserOnline(username)
    })
  } catch (error) {
    console.error(`Error fetching online status for ${username}:`, error)
    return NextResponse.json({ error: "Failed to fetch online status" }, { status: 500 })
  }
} 