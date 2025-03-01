import { NextResponse } from "next/server"
import { 
  getDiscountByCode, 
  updateDiscount, 
  deleteDiscount, 
  ensureWebstoreTables 
} from "@/lib/database/webstore"
import { pool } from "@/lib/db"
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
    
    // For ALL discount endpoints, check panel.webstore permission
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

// GET a specific discount by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const permission = await checkPermission(request)
  if (!permission.authorized) {
    return permission.response
  }

  try {
    await ensureTables()
    
    // First try to parse as ID
    const id = parseInt(params.id)
    let discount = null
    
    if (!isNaN(id)) {
      // Get discount by ID
      const [rows] = await pool.execute<RowDataPacket[]>(
        'SELECT * FROM store_discounts WHERE id = ?',
        [id]
      )
      discount = rows.length > 0 ? rows[0] : null
    } else {
      // Treat as code
      discount = await getDiscountByCode(params.id)
    }
    
    if (!discount) {
      return NextResponse.json(
        { error: "Discount not found" },
        { status: 404 }
      )
    }
    
    return NextResponse.json(discount)
  } catch (error) {
    console.error(`Error fetching discount ${params.id}:`, error)
    return NextResponse.json(
      { error: "Failed to fetch discount" },
      { status: 500 }
    )
  }
}

// PUT/PATCH update a discount
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const permission = await checkPermission(request)
  if (!permission.authorized) {
    return permission.response
  }

  try {
    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid discount ID" },
        { status: 400 }
      )
    }
    
    // Check if discount exists
    const [checkRows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM store_discounts WHERE id = ?',
      [id]
    )
    
    if (checkRows.length === 0) {
      return NextResponse.json(
        { error: "Discount not found" },
        { status: 404 }
      )
    }
    
    const data = await request.json()
    
    // Validate percentage if provided
    if (data.percentage !== undefined) {
      const percentage = parseInt(data.percentage)
      if (isNaN(percentage) || percentage <= 0 || percentage > 100) {
        return NextResponse.json(
          { error: "Percentage must be a number between 1 and 100" },
          { status: 400 }
        )
      }
      data.percentage = percentage
    }
    
    // Parse numeric values
    if (data.max_uses !== undefined) {
      data.max_uses = data.max_uses === null ? null : parseInt(data.max_uses)
    }
    
    const success = await updateDiscount(id, data as any)
    
    if (!success) {
      return NextResponse.json(
        { error: "No changes were made" },
        { status: 400 }
      )
    }
    
    // Get updated discount
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM store_discounts WHERE id = ?',
      [id]
    )
    
    return NextResponse.json(rows[0])
  } catch (error: any) {
    console.error(`Error updating discount ${params.id}:`, error)
    
    // Check for duplicate code error
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { error: "Discount code already exists" },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: "Failed to update discount" },
      { status: 500 }
    )
  }
}

// DELETE a discount
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const permission = await checkPermission(request)
  if (!permission.authorized) {
    return permission.response
  }

  try {
    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid discount ID" },
        { status: 400 }
      )
    }
    
    // Check if discount exists
    const [checkRows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM store_discounts WHERE id = ?',
      [id]
    )
    
    if (checkRows.length === 0) {
      return NextResponse.json(
        { error: "Discount not found" },
        { status: 404 }
      )
    }
    
    const success = await deleteDiscount(id)
    
    if (!success) {
      return NextResponse.json(
        { error: "Failed to delete discount" },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`Error deleting discount ${params.id}:`, error)
    return NextResponse.json(
      { error: "Failed to delete discount" },
      { status: 500 }
    )
  }
} 