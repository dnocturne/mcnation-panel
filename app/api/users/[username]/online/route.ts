import { NextResponse } from "next/server"
import { pool } from "@/lib/db"
import { RowDataPacket } from "mysql2"
import { jwtVerify } from "jose"
import { onlineUsersStore } from "@/lib/online-users-store"

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key')

export async function GET(
  request: Request,
  { params }: { params: { username: string } }
) {
  const { username } = params
  const authHeader = request.headers.get("Authorization")

  // Update last activity if user is authenticated
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1]
      const { payload } = await jwtVerify(token, JWT_SECRET)
      if ((payload as any).username) {
        onlineUsersStore.updateActivity((payload as any).username)
      }
    } catch (error) {
      console.error('Token verification error:', error)
    }
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