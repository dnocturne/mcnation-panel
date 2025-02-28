import { NextResponse } from "next/server"
import { 
  getItemById, 
  updateItem, 
  deleteItem, 
  getItemPaymentMethods,
  setItemPaymentMethods,
  ensureWebstoreTables 
} from "@/lib/database/webstore"
import { authMiddleware } from "@/app/api/auth/middleware"
import { hasPermission } from "@/lib/permissions"

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
  
  // For GET requests, we don't need to check permission (public data)
  if (request.method === 'GET') {
    return { authorized: true }
  }
  
  // For all other methods, check panel.webstore permission
  const hasAccess = await hasPermission(username, 'panel.webstore')
  if (!hasAccess) {
    return { 
      authorized: false, 
      response: NextResponse.json({ error: "Access denied" }, { status: 403 }) 
    }
  }

  return { authorized: true }
}

// GET a specific item
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await ensureTables()
    
    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid item ID" },
        { status: 400 }
      )
    }
    
    const item = await getItemById(id)
    if (!item) {
      return NextResponse.json(
        { error: "Item not found" },
        { status: 404 }
      )
    }
    
    // Get payment methods for this item
    const paymentMethods = await getItemPaymentMethods(id)
    
    return NextResponse.json({
      ...item,
      paymentMethods
    })
  } catch (error) {
    console.error(`Error fetching item ${params.id}:`, error)
    return NextResponse.json(
      { error: "Failed to fetch item" },
      { status: 500 }
    )
  }
}

// PUT/PATCH update an item
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
        { error: "Invalid item ID" },
        { status: 400 }
      )
    }
    
    const item = await getItemById(id)
    if (!item) {
      return NextResponse.json(
        { error: "Item not found" },
        { status: 404 }
      )
    }
    
    const data = await request.json()
    
    // Parse numeric values
    if (data.price) data.price = parseFloat(data.price)
    if (data.sale_price) data.sale_price = parseFloat(data.sale_price)
    if (data.category_id) data.category_id = parseInt(data.category_id)
    
    // Extract payment methods if provided
    const paymentMethodIds = data.paymentMethodIds
    delete data.paymentMethodIds
    
    const success = await updateItem(id, data)
    
    // Update payment methods if provided
    if (paymentMethodIds && Array.isArray(paymentMethodIds)) {
      await setItemPaymentMethods(id, paymentMethodIds)
    }
    
    if (!success && !paymentMethodIds) {
      return NextResponse.json(
        { error: "No changes were made" },
        { status: 400 }
      )
    }
    
    const updatedItem = await getItemById(id)
    const updatedPaymentMethods = await getItemPaymentMethods(id)
    
    return NextResponse.json({
      ...updatedItem,
      paymentMethods: updatedPaymentMethods
    })
  } catch (error) {
    console.error(`Error updating item ${params.id}:`, error)
    return NextResponse.json(
      { error: "Failed to update item" },
      { status: 500 }
    )
  }
}

// DELETE an item
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
        { error: "Invalid item ID" },
        { status: 400 }
      )
    }
    
    const item = await getItemById(id)
    if (!item) {
      return NextResponse.json(
        { error: "Item not found" },
        { status: 404 }
      )
    }
    
    const success = await deleteItem(id)
    
    if (!success) {
      return NextResponse.json(
        { error: "Failed to delete item" },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`Error deleting item ${params.id}:`, error)
    return NextResponse.json(
      { error: "Failed to delete item" },
      { status: 500 }
    )
  }
} 