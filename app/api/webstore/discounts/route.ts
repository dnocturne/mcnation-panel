import { NextResponse } from "next/server"
import { getDiscounts, createDiscount, ensureWebstoreTables } from "@/lib/database/webstore"
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

  // For ALL discount endpoints, check panel.webstore permission
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
  
  // Check panel.webstore permission for all methods
  const hasAccess = await hasPermission(username, 'panel.webstore')
  if (!hasAccess) {
    return { 
      authorized: false, 
      response: NextResponse.json({ error: "Access denied" }, { status: 403 }) 
    }
  }

  return { authorized: true }
}

// GET all discounts
export async function GET(request: Request) {
  const permission = await checkPermission(request)
  if (!permission.authorized) {
    return permission.response
  }

  try {
    await ensureTables()
    
    const { searchParams } = new URL(request.url)
    const showInactive = searchParams.get('showInactive') === 'true'
    
    const discounts = await getDiscounts(!showInactive)
    return NextResponse.json(discounts)
  } catch (error) {
    console.error("Error fetching discounts:", error)
    return NextResponse.json(
      { error: "Failed to fetch discounts" },
      { status: 500 }
    )
  }
}

// POST create new discount
export async function POST(request: Request) {
  const permission = await checkPermission(request)
  if (!permission.authorized) {
    return permission.response
  }

  try {
    const data = await request.json()
    
    if (!data.code || !data.percentage) {
      return NextResponse.json(
        { error: "Discount code and percentage are required" },
        { status: 400 }
      )
    }
    
    // Validate percentage
    const percentage = parseInt(data.percentage)
    if (isNaN(percentage) || percentage <= 0 || percentage > 100) {
      return NextResponse.json(
        { error: "Percentage must be a number between 1 and 100" },
        { status: 400 }
      )
    }
    
    // Set default values
    const discountData: any = {
      code: data.code,
      percentage,
      valid_from: data.valid_from || new Date(),
      valid_until: data.valid_until || null,
      max_uses: data.max_uses ? parseInt(data.max_uses) : null,
      times_used: 0,
      active: data.active !== undefined ? !!data.active : true
    }
    
    const discountId = await createDiscount(discountData)
    
    return NextResponse.json({ 
      id: discountId,
      ...discountData
    })
  } catch (error: any) {
    console.error("Error creating discount:", error)
    
    // Check for duplicate code error
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { error: "Discount code already exists" },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: "Failed to create discount" },
      { status: 500 }
    )
  }
} 