import { NextResponse } from "next/server"
import { pool } from "@/lib/db"
import type { RowDataPacket } from "mysql2"

const tableMap = {
  mutes: "litebans_mutes",
  bans: "litebans_bans",
  kicks: "litebans_kicks",
  warns: "litebans_warnings"
}

export async function GET(
  request: Request,
  { params }: { params: { username: string } }
) {
  const { username } = await params
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')

  if (!type || !tableMap[type as keyof typeof tableMap]) {
    return NextResponse.json({ error: "Invalid punishment type" }, { status: 400 })
  }

  try {
    const table = tableMap[type as keyof typeof tableMap]
    const query = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN active = 1 THEN 1 ELSE 0 END) as active
      FROM ${table}
      WHERE uuid IN (SELECT uuid FROM librepremium_data WHERE last_nickname = ?)
    `
    
    const [rows] = await pool.execute<RowDataPacket[]>(query, [username])
    
    return NextResponse.json({
      type,
      total: rows[0].total || 0,
      active: rows[0].active || 0
    })
  } catch (error) {
    console.error(`Error fetching punishment stats for ${username}:`, error)
    return NextResponse.json({ error: "Failed to fetch punishment stats" }, { status: 500 })
  }
} 