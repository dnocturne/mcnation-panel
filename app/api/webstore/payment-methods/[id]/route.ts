import { NextResponse } from "next/server"
import { pool } from "@/lib/db"
import { ensureWebstoreTables } from "@/lib/database/webstore"
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

// GET a specific payment method
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await ensureTables()
    
    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid payment method ID" },
        { status: 400 }
      )
    }
    
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM store_payment_methods WHERE id = ?',
      [id]
    )
    
    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Payment method not found" },
        { status: 404 }
      )
    }
    
    return NextResponse.json(rows[0])
  } catch (error) {
    console.error(`Error fetching payment method ${params.id}:`, error)
    return NextResponse.json(
      { error: "Failed to fetch payment method" },
      { status: 500 }
    )
  }
}

// PUT/PATCH update a payment method
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
        { error: "Invalid payment method ID" },
        { status: 400 }
      )
    }
    
    // Check if payment method exists
    const [checkRows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM store_payment_methods WHERE id = ?',
      [id]
    )
    
    if (checkRows.length === 0) {
      return NextResponse.json(
        { error: "Payment method not found" },
        { status: 404 }
      )
    }
    
    const data = await request.json()
    
    // Build the update query based on provided fields
    const updateFields = []
    const updateValues = []
    
    if (data.name !== undefined) {
      updateFields.push('name = ?')
      updateValues.push(data.name)
    }
    
    if (data.description !== undefined) {
      updateFields.push('description = ?')
      updateValues.push(data.description)
    }
    
    if (data.active !== undefined) {
      updateFields.push('active = ?')
      updateValues.push(!!data.active)
    }
    
    if (updateFields.length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      )
    }
    
    // Add the ID as the last parameter
    updateValues.push(id)
    
    const query = `
      UPDATE store_payment_methods 
      SET ${updateFields.join(', ')} 
      WHERE id = ?
    `
    
    const [result] = await pool.execute(query, updateValues)
    
    if ((result as any).affectedRows === 0) {
      return NextResponse.json(
        { error: "No changes were made" },
        { status: 400 }
      )
    }
    
    // Get updated payment method
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM store_payment_methods WHERE id = ?',
      [id]
    )
    
    return NextResponse.json(rows[0])
  } catch (error) {
    console.error(`Error updating payment method ${params.id}:`, error)
    return NextResponse.json(
      { error: "Failed to update payment method" },
      { status: 500 }
    )
  }
}

// DELETE a payment method
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
        { error: "Invalid payment method ID" },
        { status: 400 }
      )
    }
    
    // Check if payment method exists
    const [checkRows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM store_payment_methods WHERE id = ?',
      [id]
    )
    
    if (checkRows.length === 0) {
      return NextResponse.json(
        { error: "Payment method not found" },
        { status: 404 }
      )
    }
    
    // First check if this payment method is used by any items
    const [itemRows] = await pool.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM item_payment_methods WHERE payment_method_id = ?',
      [id]
    )
    
    if (itemRows[0].count > 0) {
      return NextResponse.json(
        { error: "Cannot delete payment method that is in use by items" },
        { status: 400 }
      )
    }
    
    const [result] = await pool.execute(
      'DELETE FROM store_payment_methods WHERE id = ?',
      [id]
    )
    
    if ((result as any).affectedRows === 0) {
      return NextResponse.json(
        { error: "Failed to delete payment method" },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`Error deleting payment method ${params.id}:`, error)
    return NextResponse.json(
      { error: "Failed to delete payment method" },
      { status: 500 }
    )
  }
} 