import { NextResponse } from "next/server"
import { jwtVerify } from "jose"
import { hasPermission } from "@/lib/permissions"

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key')

export async function checkPermission(
  request: Request,
  requiredPermission: string
) {
  try {
    const authHeader = request.headers.get("Authorization")
    if (!authHeader?.startsWith('Bearer ')) {
      return false
    }

    const token = authHeader.split(' ')[1]
    const { payload } = await jwtVerify(token, JWT_SECRET)
    const username = (payload as any).username

    return await hasPermission(username, requiredPermission)
  } catch (error) {
    console.error('Permission check error:', error)
    return false
  }
} 