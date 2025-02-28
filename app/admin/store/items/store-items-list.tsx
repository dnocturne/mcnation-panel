"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import Image from "next/image"
import { PlusCircle, Edit, Trash2, Eye, EyeOff } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"

// Define types
interface StoreItem {
  id: number
  name: string
  description: string
  price: number
  sale_price: number | null
  category_id: number | null
  image_url: string | null
  active: boolean
  created_at: string
  updated_at: string
}

interface Category {
  id: number
  name: string
  description: string | null
  order_index: number
  active: boolean
}

export function StoreItemsList() {
  const router = useRouter()
  const { data: session } = useSession()
  const [items, setItems] = useState<StoreItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showInactive, setShowInactive] = useState(false)
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  
  // Fetch items and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const categoriesRes = await fetch('/api/webstore/categories')
        const categoriesData = await categoriesRes.json()
        setCategories(categoriesData)
        
        // Fetch items with filters
        let url = `/api/webstore/items?showInactive=${showInactive}`
        if (filterCategory !== 'all') {
          url += `&category=${filterCategory}`
        }
        
        const itemsRes = await fetch(url)
        
        if (!itemsRes.ok) {
          throw new Error('Failed to fetch items')
        }
        
        const itemsData = await itemsRes.json()
        setItems(itemsData)
      } catch (error) {
        console.error('Error fetching data:', error)
        toast({
          title: "Error",
          description: "Failed to load items. Please try again.",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [showInactive, filterCategory])
  
  // Handle toggling item active status
  const toggleItemActive = async (item: StoreItem) => {
    try {
      const response = await fetch(`/api/webstore/items/${item.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          active: !item.active
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to update item')
      }
      
      // Update local state
      setItems(items.map(i => 
        i.id === item.id ? { ...i, active: !item.active } : i
      ))
      
      toast({
        title: "Success",
        description: `Item ${item.active ? 'disabled' : 'enabled'} successfully.`
      })
    } catch (error) {
      console.error('Error updating item:', error)
      toast({
        title: "Error",
        description: "Failed to update item status. Please try again.",
        variant: "destructive"
      })
    }
  }
  
  // Handle deleting an item
  const handleDeleteClick = (id: number) => {
    setDeleteItemId(id)
    setDeleteDialogOpen(true)
  }
  
  const confirmDelete = async () => {
    if (!deleteItemId) return
    
    try {
      const response = await fetch(`/api/webstore/items/${deleteItemId}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete item')
      }
      
      // Update local state
      setItems(items.filter(i => i.id !== deleteItemId))
      
      toast({
        title: "Success",
        description: "Item deleted successfully."
      })
    } catch (error) {
      console.error('Error deleting item:', error)
      toast({
        title: "Error",
        description: "Failed to delete item. Please try again.",
        variant: "destructive"
      })
    } finally {
      setDeleteDialogOpen(false)
      setDeleteItemId(null)
    }
  }
  
  // Format price for display
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD' 
    }).format(price)
  }
  
  // Get category name by ID
  const getCategoryName = (categoryId: number | null) => {
    if (!categoryId) return 'None'
    const category = categories.find(c => c.id === categoryId)
    return category ? category.name : 'Unknown'
  }
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Select
            value={filterCategory}
            onValueChange={setFilterCategory}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="showInactive"
              checked={showInactive}
              onCheckedChange={(checked) => setShowInactive(!!checked)}
            />
            <Label htmlFor="showInactive">Show inactive items</Label>
          </div>
        </div>
        
        <Button asChild>
          <Link href="/admin/store/items/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Item
          </Link>
        </Button>
      </div>
      
      {items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-40">
            <p className="text-muted-foreground mb-4">No items found.</p>
            <Button asChild>
              <Link href="/admin/store/items/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Your First Item
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">ID</TableHead>
                  <TableHead className="w-[200px]">Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Sale Price</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.id}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{getCategoryName(item.category_id)}</TableCell>
                    <TableCell>{formatPrice(item.price)}</TableCell>
                    <TableCell>
                      {item.sale_price ? formatPrice(item.sale_price) : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.active ? "default" : "outline"}>
                        {item.active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-4 w-4"
                            >
                              <circle cx="12" cy="12" r="1" />
                              <circle cx="12" cy="5" r="1" />
                              <circle cx="12" cy="19" r="1" />
                            </svg>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/store/items/${item.id}`}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleItemActive(item)}>
                            {item.active ? (
                              <>
                                <EyeOff className="mr-2 h-4 w-4" />
                                Disable
                              </>
                            ) : (
                              <>
                                <Eye className="mr-2 h-4 w-4" />
                                Enable
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDeleteClick(item.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this item? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 