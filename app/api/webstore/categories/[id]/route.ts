import { NextResponse } from "next/server"
import { getCategoryById, updateCategory, deleteCategory, ensureWebstoreTables } from "@/lib/database/webstore"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { hasPermission } from "@/lib/permissions"

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
    
    // For GET requests, we don't need to check permission (public data)
    if (request.method === 'GET') {
      return { authorized: true }
    }
    
    // For all other methods, check panel.webstore permission
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