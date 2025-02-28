import { NextResponse } from "next/server"
import { ensureWebstoreTables } from "@/lib/database/webstore"
import { authMiddleware } from "@/app/api/auth/middleware"
import { hasPermission } from "@/lib/permissions"

// Initialize the webstore tables - protected by panel.webstore permission
export async function POST(request: Request) {
  // Verify authentication
  const authResponse = await authMiddleware(request)
  if (authResponse.status !== 200) {
    return authResponse
  }

  try {
    // Extract username from token for permission check
    const authHeader = request.headers.get("Authorization")
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const tokenData = JSON.parse(atob(token.split('.')[1]))
    const username = tokenData.username || tokenData.sub
    
    if (!username) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }
    
    // Check permission
    const hasAccess = await hasPermission(username, 'panel.webstore')
    if (!hasAccess) {
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