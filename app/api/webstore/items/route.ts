import { NextResponse } from "next/server"
import { getItems, createItem, ensureWebstoreTables } from "@/lib/database/webstore"
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

// GET all items (optionally filtered by category)
export async function GET(request: Request) {
  try {
    await ensureTables()
    
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('category')
    const showInactive = searchParams.get('showInactive') === 'true'
    
    let items = []
    if (categoryId) {
      const id = parseInt(categoryId)
      if (!isNaN(id)) {
        items = await getItems(!showInactive, id)
      } else {
        return NextResponse.json(
          { error: "Invalid category ID" },
          { status: 400 }
        )
      }
    } else {
      items = await getItems(!showInactive)
    }
    
    return NextResponse.json(items)
  } catch (error) {
    console.error("Error fetching items:", error)
    return NextResponse.json(
      { error: "Failed to fetch items" },
      { status: 500 }
    )
  }
}

// POST create new item
export async function POST(request: Request) {
  const permission = await checkPermission(request)
  if (!permission.authorized) {
    return permission.response
  }

  try {
    const data = await request.json()
    
    if (!data.name || !data.price) {
      return NextResponse.json(
        { error: "Item name and price are required" },
        { status: 400 }
      )
    }
    
    // Parse numeric values
    if (data.price) data.price = parseFloat(data.price)
    if (data.sale_price) data.sale_price = parseFloat(data.sale_price)
    if (data.category_id) data.category_id = parseInt(data.category_id)
    
    const itemId = await createItem(data)
    
    return NextResponse.json({ 
      id: itemId,
      ...data
    })
  } catch (error) {
    console.error("Error creating item:", error)
    return NextResponse.json(
      { error: "Failed to create item" },
      { status: 500 }
    )
  }
} 