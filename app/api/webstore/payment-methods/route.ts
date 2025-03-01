import { NextResponse } from "next/server"
import { pool } from "@/lib/db"
import { getPaymentMethods, ensureWebstoreTables } from "@/lib/database/webstore"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { hasPermission } from "@/lib/permissions"
import { RowDataPacket } from "mysql2"

// Initialize tables if needed first
async function ensureTables() {
  await ensureWebstoreTables()
}

// Check if user has webstore permission using NextAuth
async function checkPermission(request: Request): Promise<{ authorized: boolean, response?: NextResponse }> {
  try {
    // For GET, allow public access
    if (request.method === 'GET') {
      return { authorized: true }
    }
    
    // For all other methods, check panel.webstore permission
    // Get session from NextAuth
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      console.log('No authenticated user found in session')
      return { 
        authorized: false, 
        response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) 
      }
    }
    
    const username = session.user.name
    
    if (!username) {
      console.log('Username missing in session:', session)
      return { 
        authorized: false, 
        response: NextResponse.json({ error: "Invalid session" }, { status: 401 }) 
      }
    }
    
    // Check panel.webstore permission
    console.log(`Checking webstore permission for user ${username}`)
    const hasAccess = await hasPermission(username, 'panel.webstore')
    
    if (!hasAccess) {
      console.log(`User ${username} denied access to webstore admin`)
      return { 
        authorized: false, 
        response: NextResponse.json({ error: "Access denied" }, { status: 403 }) 
      }
    }

    return { authorized: true }
  } catch (error) {
    console.error('Error in permission check:', error)
    return {
      authorized: false,
      response: NextResponse.json({ error: "Authentication error" }, { status: 500 })
    }
  }
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