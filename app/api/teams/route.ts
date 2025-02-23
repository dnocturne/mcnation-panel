import { NextResponse } from "next/server"
import { pool } from "@/lib/db"
import { RowDataPacket } from "mysql2"

interface TeamMember {
  username: string
  role: string
  avatarUrl: string | null
}

export async function GET() {
  try {
    // Get the staff track order
    const trackQuery = `
      SELECT groups
      FROM luckperms_tracks
      WHERE name = 'staff'
    `
    const [trackRows] = await pool.execute<RowDataPacket[]>(trackQuery)
    const roles = JSON.parse(trackRows[0].groups as string)

    // Get all team members
    const teamQuery = `
      SELECT username, permgroups
      FROM PlayerData
      WHERE permgroups REGEXP ?
    `
    const rolePattern = roles.join('|')
    const [teamRows] = await pool.execute<RowDataPacket[]>(teamQuery, [rolePattern])

    // Process and organize team members by role
    const teamMembers = teamRows.map(row => {
      const groups = row.permgroups.split(',').map((g: string) => g.trim())
      const highestRole = groups.reduce((highest: string, current: string) => {
        const highestIndex = roles.indexOf(highest)
        const currentIndex = roles.indexOf(current)
        return currentIndex > highestIndex ? current : highest
      }, groups[0])

      return {
        username: row.username,
        role: highestRole,
        avatarUrl: `/avatars/${row.username}.jpg`
      }
    })

    // Group members by role
    const teamByRole = teamMembers.reduce((acc: Record<string, TeamMember[]>, member: TeamMember) => {
      if (!acc[member.role]) {
        acc[member.role] = []
      }
      acc[member.role].push(member)
      return acc
    }, {})

    // Sort members within each role by username
    Object.values(teamByRole).forEach(members => {
      members.sort((a, b) => a.username.localeCompare(b.username))
    })

    return NextResponse.json({ 
      teamByRole,
      roles
    })
  } catch (error) {
    console.error('Error fetching team hierarchy:', error)
    return NextResponse.json(
      { error: "Failed to fetch team hierarchy" },
      { status: 500 }
    )
  }
} 