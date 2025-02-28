import { NextResponse } from "next/server"
import { getCategories, createCategory, ensureWebstoreTables } from "@/lib/database/webstore"
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

// GET all categories
export async function GET() {
  try {
    await ensureTables()
    
    const categories = await getCategories(false) // Get all categories including inactive ones
    return NextResponse.json(categories)
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    )
  }
}

// POST create new category
export async function POST(request: Request) {
  const permission = await checkPermission(request)
  if (!permission.authorized) {
    return permission.response
  }

  try {
    const { name, description, order_index } = await request.json()
    
    if (!name) {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 }
      )
    }
    
    const categoryId = await createCategory(
      name, 
      description || null, 
      order_index || 0
    )
    
    return NextResponse.json({ id: categoryId, name, description, order_index })
  } catch (error) {
    console.error("Error creating category:", error)
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    )
  }
} 