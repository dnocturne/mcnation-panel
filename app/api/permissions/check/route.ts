import { NextResponse } from "next/server"
import { checkPermission } from "@/middleware/check-permission"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const permission = searchParams.get('permission')

  if (!permission) {
    return NextResponse.json({ error: "Permission parameter required" }, { status: 400 })
  }

  const hasAccess = await checkPermission(request, permission)
  return NextResponse.json({ hasPermission: hasAccess })
} 