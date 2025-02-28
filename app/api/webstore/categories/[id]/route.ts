import { NextResponse } from "next/server"
import { getCategoryById, updateCategory, deleteCategory, ensureWebstoreTables } from "@/lib/database/webstore"
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

// GET a specific category
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await ensureTables()
    
    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid category ID" },
        { status: 400 }
      )
    }
    
    const category = await getCategoryById(id)
    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      )
    }
    
    return NextResponse.json(category)
  } catch (error) {
    console.error(`Error fetching category ${params.id}:`, error)
    return NextResponse.json(
      { error: "Failed to fetch category" },
      { status: 500 }
    )
  }
}

// PUT/PATCH update a category
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
        { error: "Invalid category ID" },
        { status: 400 }
      )
    }
    
    const category = await getCategoryById(id)
    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      )
    }
    
    const data = await request.json()
    const success = await updateCategory(id, data)
    
    if (!success) {
      return NextResponse.json(
        { error: "No changes were made" },
        { status: 400 }
      )
    }
    
    const updatedCategory = await getCategoryById(id)
    return NextResponse.json(updatedCategory)
  } catch (error) {
    console.error(`Error updating category ${params.id}:`, error)
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    )
  }
}

// DELETE a category
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
        { error: "Invalid category ID" },
        { status: 400 }
      )
    }
    
    const category = await getCategoryById(id)
    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      )
    }
    
    const success = await deleteCategory(id)
    
    if (!success) {
      return NextResponse.json(
        { error: "Failed to delete category" },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`Error deleting category ${params.id}:`, error)
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    )
  }
} 