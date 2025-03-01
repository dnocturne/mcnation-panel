import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { hasPermission } from "@/lib/permissions"

export async function checkPermission(
  request: Request,
  requiredPermission: string
) {
  try {
    // Get session from NextAuth instead of JWT token
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      console.log('No authenticated user found')
      return false
    }
    
    // Get username from NextAuth session
    const username = session.user.name
    
    if (!username) {
      console.error('Username missing in session:', session)
      return false
    }
    
    console.log(`Checking permission ${requiredPermission} for user ${username}`)
    return await hasPermission(username, requiredPermission)
  } catch (error) {
    console.error('Permission check error:', error)
    return false
  }
} 