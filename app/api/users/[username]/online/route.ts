import { NextResponse } from "next/server"
import { pool } from "@/lib/db"
import { RowDataPacket } from "mysql2"
import { jwtVerify } from "jose"

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key')

export async function GET(
  request: Request,
  { params }: { params: { username: string } }
) {
  const { username } = await params

  try {
    const query = `
      SELECT 
        online as isOnlineServer
      FROM PlayerData 
      WHERE username = ?
    `
    const [rows] = await pool.execute<RowDataPacket[]>(query, [username])
    
    const authHeader = request.headers.get("Authorization")
    let isOnlineWeb = false
    
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1]
        const { payload } = await jwtVerify(token, JWT_SECRET)
        isOnlineWeb = (payload as any).username === username
      } catch (error) {
        console.error('Token verification error:', error)
      }
    }

    return NextResponse.json({
      isOnlineServer: Boolean(rows[0]?.isOnlineServer),
      isOnlineWeb
    })
  } catch (error) {
    console.error(`Error fetching online status for ${username}:`, error)
    return NextResponse.json({ error: "Failed to fetch online status" }, { status: 500 })
  }
} 