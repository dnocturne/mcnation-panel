import { NextResponse } from "next/server"
import { pool } from "@/lib/db"
import { RowDataPacket } from "mysql2"

interface StaffMember {
  username: string
  role: string
  avatarUrl: string | null
}

export async function GET() {
  try {
    // First get the staff track order
    const trackQuery = `
      SELECT groups
      FROM luckperms_tracks
      WHERE name = 'staff'
    `
    const [trackRows] = await pool.execute<RowDataPacket[]>(trackQuery)
    const staffRoles = JSON.parse(trackRows[0].groups as string)

    // Get all users with staff roles
    const staffQuery = `
      SELECT username, permgroups
      FROM PlayerData
      WHERE permgroups REGEXP ?
    `
    const rolePattern = staffRoles.join('|')
    const [staffRows] = await pool.execute<RowDataPacket[]>(staffQuery, [rolePattern])

    // Process and sort staff members by role hierarchy
    const staffMembers: StaffMember[] = staffRows.map(row => {
      const groups = row.permgroups.split(',').map((g: string) => g.trim())
      const highestRole = groups.reduce((highest: string, current: string) => {
        const highestIndex = staffRoles.indexOf(highest)
        const currentIndex = staffRoles.indexOf(current)
        return currentIndex > highestIndex ? current : highest
      }, groups[0])

      return {
        username: row.username,
        role: highestRole,
        avatarUrl: `/avatars/${row.username}.jpg`
      }
    })

    // Sort by role hierarchy (highest first)
    staffMembers.sort((a, b) => 
      staffRoles.indexOf(b.role) - staffRoles.indexOf(a.role)
    )

    return NextResponse.json({ staffMembers, roles: staffRoles })
  } catch (error) {
    console.error('Error fetching staff hierarchy:', error)
    return NextResponse.json(
      { error: "Failed to fetch staff hierarchy" },
      { status: 500 }
    )
  }
} 