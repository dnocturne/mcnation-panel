import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { hasPermission } from "@/lib/permissions"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const permission = searchParams.get('permission')

  if (!permission) {
    return NextResponse.json({ error: "Permission parameter required" }, { status: 400 })
  }

  // Get the authenticated user from the session
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.name) {
    console.log('No authenticated user found or username missing')
    return NextResponse.json({ hasPermission: false })
  }
  
  // Check permission directly using the username from session
  const username = session.user.name
  console.log(`Checking permission ${permission} for user ${username}`)
  
  const hasAccess = await hasPermission(username, permission)
  return NextResponse.json({ hasPermission: hasAccess })
} 