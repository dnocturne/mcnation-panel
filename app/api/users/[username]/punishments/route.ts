import { NextResponse } from "next/server"
import { pool } from "@/lib/db"
import { RowDataPacket } from "mysql2"

interface PunishmentRow extends RowDataPacket {
  id: number
  banned_by_name: string
  reason: string
  time: number
  until: number
  active: number
  removed_by_name: string | null
  removed_by_reason: string | null
  player_name: string
}

export async function GET(
  request: Request,
  { params }: { params: { username: string } }
) {
  const { username } = await params
  if (!username) {
    return NextResponse.json(
      { error: "Missing username parameter" },
      { status: 400 }
    )
  }

  try {
    const query = `
      SELECT 
        p.id,
        p.banned_by_name,
        p.reason,
        p.time,
        p.until,
        CAST(p.active AS SIGNED) as active,
        p.removed_by_name,
        p.removed_by_reason,
        COALESCE(u.last_nickname, 'Unknown') as player_name,
        'mute' as type
      FROM litebans_mutes p
      LEFT JOIN librepremium_data u ON p.uuid = u.uuid
      WHERE p.uuid IN (
        SELECT uuid 
        FROM librepremium_data 
        WHERE last_nickname = ?
      )
      AND (? = 'active' AND p.active = 1 OR ? = 'expired' AND p.active = 0 OR ? = 'all')
      UNION ALL
      SELECT 
        p.id,
        p.banned_by_name,
        p.reason,
        p.time,
        p.until,
        CAST(p.active AS SIGNED) as active,
        p.removed_by_name,
        p.removed_by_reason,
        COALESCE(u.last_nickname, 'Unknown') as player_name,
        'ban' as type
      FROM litebans_bans p
      LEFT JOIN librepremium_data u ON p.uuid = u.uuid
      WHERE p.uuid IN (
        SELECT uuid 
        FROM librepremium_data 
        WHERE last_nickname = ?
      )
      AND (? = 'active' AND p.active = 1 OR ? = 'expired' AND p.active = 0 OR ? = 'all')
      UNION ALL
      SELECT 
        p.id,
        p.banned_by_name,
        p.reason,
        p.time,
        p.until,
        CAST(p.active AS SIGNED) as active,
        p.removed_by_name,
        p.removed_by_reason,
        COALESCE(u.last_nickname, 'Unknown') as player_name,
        'warn' as type
      FROM litebans_warnings p
      LEFT JOIN librepremium_data u ON p.uuid = u.uuid
      WHERE p.uuid IN (
        SELECT uuid 
        FROM librepremium_data 
        WHERE last_nickname = ?
      )
      AND (? = 'active' AND p.active = 1 OR ? = 'expired' AND p.active = 0 OR ? = 'all')
      ORDER BY time DESC`

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'all'

    const [rows] = await pool.execute<PunishmentRow[]>(
      query,
      [
        username, status, status, status,
        username, status, status, status,
        username, status, status, status
      ]
    )

    return NextResponse.json({
      items: rows
    })
  } catch (error) {
    console.error(`Error fetching punishments for user ${username}:`, error)
    return NextResponse.json(
      { error: "Failed to fetch user punishments" },
      { status: 500 }
    )
  }
} 