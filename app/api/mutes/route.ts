import { NextResponse } from "next/server"
import { pool } from "@/lib/db"
import type { RowDataPacket } from "mysql2"

interface MuteRow extends RowDataPacket {
  id: number
  banned_by_name: string
  reason: string
  time: number
  until: number
  active: number
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = Number.parseInt(searchParams.get("page") || "1")
  const pageSize = Number.parseInt(searchParams.get("pageSize") || "10")
  const offset = (page - 1) * pageSize

  try {
    const [rows] = await pool.execute<MuteRow[]>(
      `SELECT 
        id,
        banned_by_name,
        reason,
        time,
        until,
        active
      FROM litebans_mutes
      ORDER BY time DESC
      LIMIT ? OFFSET ?`,
      [pageSize, offset]
    )

    const [totalResult] = await pool.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM litebans_mutes'
    )

    return NextResponse.json({
      items: rows,
      total: totalResult[0].count
    })
  } catch (error) {
    console.error('Error fetching mutes:', error)
    return NextResponse.json(
      { error: "Failed to fetch mutes" },
      { status: 500 }
    )
  }
} 