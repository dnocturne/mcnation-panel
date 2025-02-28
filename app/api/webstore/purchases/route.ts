import { NextResponse } from "next/server"
import { pool } from "@/lib/db"
import { ensureWebstoreTables } from "@/lib/database/webstore"
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

  // All purchase-related operations require panel.webstore permission
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

// GET all purchases with pagination and filtering
export async function GET(request: Request) {
  const permission = await checkPermission(request)
  if (!permission.authorized) {
    return permission.response
  }

  try {
    await ensureTables()
    
    // Parse search query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '25')
    const offset = (page - 1) * limit
    const minecraft_uuid = searchParams.get('minecraft_uuid')
    const item_id = searchParams.get('item_id')
    const status = searchParams.get('status')
    const payment_method = searchParams.get('payment_method')
    const fromDate = searchParams.get('from')
    const toDate = searchParams.get('to')
    
    // Build the query
    let query = `
      SELECT p.*, i.name as item_name, pm.name as payment_method_name 
      FROM store_purchases p
      LEFT JOIN store_items i ON p.item_id = i.id
      LEFT JOIN store_payment_methods pm ON p.payment_method_id = pm.id
      WHERE 1=1
    `
    
    const params: any[] = []
    
    // Add filters if provided
    if (minecraft_uuid) {
      query += " AND p.minecraft_uuid = ?"
      params.push(minecraft_uuid)
    }
    
    if (item_id) {
      query += " AND p.item_id = ?"
      params.push(parseInt(item_id))
    }
    
    if (status) {
      query += " AND p.status = ?"
      params.push(status)
    }
    
    if (payment_method) {
      query += " AND p.payment_method_id = ?"
      params.push(parseInt(payment_method))
    }
    
    if (fromDate) {
      query += " AND p.created_at >= ?"
      params.push(fromDate)
    }
    
    if (toDate) {
      query += " AND p.created_at <= ?"
      params.push(toDate)
    }
    
    // Count total records for pagination
    const countQuery = query.replace("SELECT p.*, i.name as item_name, pm.name as payment_method_name", "SELECT COUNT(*) as total")
    const [countRows] = await pool.execute<RowDataPacket[]>(countQuery, params)
    const totalRecords = countRows[0].total
    
    // Add sorting and pagination
    query += " ORDER BY p.created_at DESC LIMIT ? OFFSET ?"
    params.push(limit, offset)
    
    // Execute the query
    const [rows] = await pool.execute<RowDataPacket[]>(query, params)
    
    // Calculate pagination metadata
    const totalPages = Math.ceil(totalRecords / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1
    
    return NextResponse.json({
      data: rows,
      pagination: {
        page,
        limit,
        totalRecords,
        totalPages,
        hasNextPage,
        hasPrevPage
      }
    })
  } catch (error) {
    console.error('Error fetching purchases:', error)
    return NextResponse.json(
      { error: "Failed to fetch purchases" },
      { status: 500 }
    )
  }
}

// POST create a new purchase record (usually called by frontend or webhook)
export async function POST(request: Request) {
  try {
    await ensureTables()
    
    const data = await request.json()
    
    // Validate required fields
    if (!data.minecraft_uuid) {
      return NextResponse.json(
        { error: "Minecraft UUID is required" },
        { status: 400 }
      )
    }
    
    if (!data.item_id) {
      return NextResponse.json(
        { error: "Item ID is required" },
        { status: 400 }
      )
    }
    
    if (!data.payment_method_id) {
      return NextResponse.json(
        { error: "Payment method ID is required" },
        { status: 400 }
      )
    }
    
    // Verify item exists
    const [itemRows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM store_items WHERE id = ?',
      [data.item_id]
    )
    
    if (itemRows.length === 0) {
      return NextResponse.json(
        { error: "Item not found" },
        { status: 400 }
      )
    }
    
    // Verify payment method exists
    const [methodRows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM store_payment_methods WHERE id = ?',
      [data.payment_method_id]
    )
    
    if (methodRows.length === 0) {
      return NextResponse.json(
        { error: "Payment method not found" },
        { status: 400 }
      )
    }
    
    // Check if discount code exists and is valid if provided
    let finalPrice = itemRows[0].price
    let discountId = null
    
    if (data.discount_code) {
      const [discountRows] = await pool.execute<RowDataPacket[]>(
        'SELECT * FROM store_discounts WHERE code = ? AND active = TRUE',
        [data.discount_code]
      )
      
      if (discountRows.length === 0) {
        return NextResponse.json(
          { error: "Invalid discount code" },
          { status: 400 }
        )
      }
      
      // Apply discount
      const discount = discountRows[0]
      discountId = discount.id
      
      // Calculate price with discount
      const discountAmount = itemRows[0].price * (discount.percentage / 100)
      finalPrice = Math.max(0, itemRows[0].price - discountAmount)
    }
    
    // Insert the purchase record
    const [result] = await pool.execute(
      `INSERT INTO store_purchases 
       (minecraft_uuid, item_id, payment_method_id, discount_id, amount, status, transaction_id, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.minecraft_uuid,
        data.item_id,
        data.payment_method_id,
        discountId,
        finalPrice,
        data.status || 'pending',
        data.transaction_id || null,
        data.notes || null
      ]
    )
    
    const purchaseId = (result as any).insertId
    
    // Get the newly created purchase record
    const [purchaseRows] = await pool.execute<RowDataPacket[]>(
      `SELECT p.*, i.name as item_name, pm.name as payment_method_name 
       FROM store_purchases p
       LEFT JOIN store_items i ON p.item_id = i.id
       LEFT JOIN store_payment_methods pm ON p.payment_method_id = pm.id
       WHERE p.id = ?`,
      [purchaseId]
    )
    
    return NextResponse.json(purchaseRows[0], { status: 201 })
  } catch (error) {
    console.error('Error creating purchase record:', error)
    return NextResponse.json(
      { error: "Failed to create purchase record" },
      { status: 500 }
    )
  }
} 