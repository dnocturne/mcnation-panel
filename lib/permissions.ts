import { pool } from "@/lib/db"
import { RowDataPacket } from "mysql2"

interface Permission {
  permission: string
  value: number
}

export async function getUserPermissions(username: string): Promise<Permission[]> {
  try {
    // First get user's groups
    const groupQuery = `
      SELECT permgroups
      FROM PlayerData
      WHERE username = ?
    `
    const [groupRows] = await pool.execute<RowDataPacket[]>(groupQuery, [username])
    
    // Split groups and clean them up (remove spaces, empty entries)
    const groups = (groupRows[0]?.permgroups || 'default')
      .split(',')
      .map((g: string) => g.trim())
      .filter(Boolean)

    if (groups.length === 0) {
      groups.push('default')
    }

    console.log('User groups:', groups) // Debug log

    // Then get permissions for all groups
    const permQuery = `
      SELECT permission, value
      FROM luckperms_group_permissions
      WHERE name IN (${groups.map(() => '?').join(',')})
    `
    const [permRows] = await pool.execute<RowDataPacket[]>(permQuery, groups)
    
    console.log('User permissions:', permRows) // Debug log
    
    return permRows as Permission[]
  } catch (error) {
    console.error('Error fetching permissions:', error)
    return []
  }
}

export async function hasPermission(username: string, requiredPermission: string): Promise<boolean> {
  const permissions = await getUserPermissions(username)
  
  // Check if any of the user's groups has the required permission with value = 1
  return permissions.some(p => 
    p.permission === requiredPermission && p.value === 1
  )
} 