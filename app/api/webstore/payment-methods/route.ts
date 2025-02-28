import { NextResponse } from "next/server"
import { pool } from "@/lib/db"
import { getPaymentMethods, ensureWebstoreTables } from "@/lib/database/webstore"
import { authMiddleware } from "@/app/api/auth/middleware"
import { hasPermission } from "@/lib/permissions"
import { RowDataPacket } from "mysql2"

// Initialize tables if needed first
async function ensureTables() {
  await ensureWebstoreTables()
}

// Check if user has webstore permission
async function checkPermission(request: Request): Promise<{ authorized: boolean, response?: NextResponse }> {
  // Verify authentication
  const authResponse = await authMiddleware(request)
  if (authResponse.status !== 200) {
    return { authorized: false, response: authResponse }
  }

  // For GET, allow public access
  if (request.method === 'GET') {
    return { authorized: true }
  }

  // For all other methods, check panel.webstore permission
  const authHeader = request.headers.get("Authorization")
  if (!authHeader?.startsWith('Bearer ')) {
    return { 
      authorized: false, 
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) 
    }
  }

  const token = authHeader.split(' ')[1]
  const tokenData = JSON.parse(atob(token.split('.')[1]))
  const username = tokenData.username || tokenData.sub
  
  if (!username) {
    return { 
      authorized: false, 
      response: NextResponse.json({ error: "Invalid token" }, { status: 401 }) 
    }
  }
  
  const hasAccess = await hasPermission(username, 'panel.webstore')
  if (!hasAccess) {
    return { 
      authorized: false, 
      response: NextResponse.json({ error: "Access denied" }, { status: 403 }) 
    }
  }

  return { authorized: true }
}

// GET all payment methods
export async function GET() {
  try {
    await ensureTables()
    
    const paymentMethods = await getPaymentMethods(false) // Get all payment methods including inactive ones
    return NextResponse.json(paymentMethods)
  } catch (error) {
    console.error("Error fetching payment methods:", error)
    return NextResponse.json(
      { error: "Failed to fetch payment methods" },
      { status: 500 }
    )
  }
}

// POST create new payment method
export async function POST(request: Request) {
  const permission = await checkPermission(request)
  if (!permission.authorized) {
    return permission.response
  }

  try {
    const { name, description, active } = await request.json()
    
    if (!name) {
      return NextResponse.json(
        { error: "Payment method name is required" },
        { status: 400 }
      )
    }
    
    const [result] = await pool.execute(
      'INSERT INTO store_payment_methods (name, description, active) VALUES (?, ?, ?)',
      [name, description || null, active !== undefined ? !!active : true]
    )
    
    const id = (result as any).insertId
    
    return NextResponse.json({ 
      id,
      name,
      description: description || null,
      active: active !== undefined ? !!active : true
    })
  } catch (error) {
    console.error("Error creating payment method:", error)
    return NextResponse.json(
      { error: "Failed to create payment method" },
      { status: 500 }
    )
  }
} 