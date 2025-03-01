import { NextResponse } from "next/server"
import { ensureWebstoreTables } from "@/lib/database/webstore"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { hasPermission } from "@/lib/permissions"

// Initialize the webstore tables - protected by panel.webstore permission
export async function POST(request: Request) {
  try {
    // Get session from NextAuth
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      console.log('No authenticated user found in session')
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const username = session.user.name
    
    if (!username) {
      console.log('Username missing in session:', session)
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }
    
    // Check permission
    console.log(`Checking webstore permission for user ${username}`)
    const hasAccess = await hasPermission(username, 'panel.webstore')
    
    if (!hasAccess) {
      console.log(`User ${username} denied access to webstore admin`)
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Initialize tables
    await ensureWebstoreTables()
    return NextResponse.json({ success: true, message: "Store tables initialized" })
  } catch (error) {
    console.error("Error initializing webstore tables:", error)
    return NextResponse.json(
      { error: "Failed to initialize webstore tables" },
      { status: 500 }
    )
  }
} 