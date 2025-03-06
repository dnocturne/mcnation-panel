"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-store"
import { PlusCircle, Edit, Trash2, ArrowUp, ArrowDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

// Define types
interface Category {
  id: number
  name: string
  description: string | null
  order_index: number
  active: boolean
}

export function CategoriesList() {
  const { token } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showInactive, setShowInactive] = useState(false)
  
  // Dialog states
  const [isEditing, setIsEditing] = useState(false)
  const [editCategory, setEditCategory] = useState<Category | null>(null)
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteCategoryId, setDeleteCategoryId] = useState<number | null>(null)
  
  // Form states
  const [categoryName, setCategoryName] = useState("")
  const [categoryDescription, setCategoryDescription] = useState("")
  const [categoryActive, setCategoryActive] = useState(true)
  
  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/webstore/categories')
        
        if (!res.ok) {
          throw new Error('Failed to fetch categories')
        }
        
        const data = await res.json()
        setCategories(data.sort((a: Category, b: Category) => a.order_index - b.order_index))
      } catch (error) {
        console.error('Error fetching categories:', error)
        toast({
          title: "Error",
          description: "Failed to load categories. Please try again.",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }
    
    fetchCategories()
  }, [])
  
  // Reset form
  const resetForm = () => {
    setIsEditing(false)
    setEditCategory(null)
    setCategoryName("")
    setCategoryDescription("")
    setCategoryActive(true)
  }
  
  // Open category dialog for creating
  const handleAddCategory = () => {
    resetForm()
    setCategoryDialogOpen(true)
  }
  
  // Open category dialog for editing
  const handleEditCategory = (category: Category) => {
    setIsEditing(true)
    setEditCategory(category)
    setCategoryName(category.name)
    setCategoryDescription(category.description || "")
    setCategoryActive(category.active)
    setCategoryDialogOpen(true)
  }
  
  // Handle category save (create or update)
  const handleSaveCategory = async () => {
    if (!categoryName.trim()) {
      toast({
        title: "Error",
        description: "Category name is required.",
        variant: "destructive"
      })
      return
    }
    
    try {
      if (isEditing && editCategory) {
        // Update existing category
        const res = await fetch(`/api/webstore/categories/${editCategory.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            name: categoryName,
            description: categoryDescription || null,
            active: categoryActive
          })
        })
        
        if (!res.ok) {
          throw new Error('Failed to update category')
        }
        
        // Update local state
        setCategories(categories.map(c => 
          c.id === editCategory.id 
            ? { 
                ...c, 
                name: categoryName, 
                description: categoryDescription || null,
                active: categoryActive
              } 
            : c
        ))
        
        toast({
          title: "Success",
          description: "Category updated successfully."
        })
      } else {
        // Create new category
        const highestOrderIndex = categories.length > 0 
          ? Math.max(...categories.map(c => c.order_index)) 
          : -1
        const newOrderIndex = highestOrderIndex + 1
        
        const res = await fetch('/api/webstore/categories', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            name: categoryName,
            description: categoryDescription || null,
            order_index: newOrderIndex,
            active: categoryActive
          })
        })
        
        if (!res.ok) {
          throw new Error('Failed to create category')
        }
        
        const newCategory = await res.json()
        
        // Add to local state
        setCategories([...categories, newCategory])
        
        toast({
          title: "Success",
          description: "Category created successfully."
        })
      }
      
      // Close dialog and reset form
      setCategoryDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error('Error saving category:', error)
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? 'update' : 'create'} category. Please try again.`,
        variant: "destructive"
      })
    }
  }
  
  // Open delete confirmation dialog
  const handleDeleteClick = (id: number) => {
    setDeleteCategoryId(id)
    setDeleteDialogOpen(true)
  }
  
  // Handle category deletion
  const confirmDelete = async () => {
    if (!deleteCategoryId) return
    
    try {
      const res = await fetch(`/api/webstore/categories/${deleteCategoryId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      
      if (!res.ok) {
        throw new Error('Failed to delete category')
      }
      
      // Update local state
      setCategories(categories.filter(c => c.id !== deleteCategoryId))
      
      toast({
        title: "Success",
        description: "Category deleted successfully."
      })
    } catch (error) {
      console.error('Error deleting category:', error)
      toast({
        title: "Error",
        description: "Failed to delete category. Please try again.",
        variant: "destructive"
      })
    } finally {
      setDeleteDialogOpen(false)
      setDeleteCategoryId(null)
    }
  }
  
  // Handle moving category up or down
  const handleMoveCategory = async (categoryId: number, direction: 'up' | 'down') => {
    const categoryIndex = categories.findIndex(c => c.id === categoryId)
    if (categoryIndex === -1) return
    
    // Can't move first item up or last item down
    if (
      (direction === 'up' && categoryIndex === 0) || 
      (direction === 'down' && categoryIndex === categories.length - 1)
    ) {
      return
    }
    
    const newCategories = [...categories]
    const targetIndex = direction === 'up' ? categoryIndex - 1 : categoryIndex + 1
    
    // Swap order_index values
    const tempOrderIndex = newCategories[targetIndex].order_index
    newCategories[targetIndex].order_index = newCategories[categoryIndex].order_index
    newCategories[categoryIndex].order_index = tempOrderIndex
    
    // Swap positions in array
    const temp = newCategories[categoryIndex]
    newCategories[categoryIndex] = newCategories[targetIndex]
    newCategories[targetIndex] = temp
    
    try {
      // Update first category
      await fetch(`/api/webstore/categories/${newCategories[categoryIndex].id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          order_index: newCategories[categoryIndex].order_index
        })
      })
      
      // Update second category
      await fetch(`/api/webstore/categories/${newCategories[targetIndex].id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          order_index: newCategories[targetIndex].order_index
        })
      })
      
      // Update local state
      setCategories(newCategories)
    } catch (error) {
      console.error('Error reordering categories:', error)
      toast({
        title: "Error",
        description: "Failed to reorder categories. Please try again.",
        variant: "destructive"
      })
    }
  }
  
  // Toggle showing inactive categories
  const toggleShowInactive = () => {
    setShowInactive(!showInactive)
  }
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }
  
  // Filter categories if needed
  const filteredCategories = showInactive 
    ? categories 
    : categories.filter(c => c.active)
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="showInactive"
            checked={showInactive}
            onCheckedChange={toggleShowInactive}
          />
          <Label htmlFor="showInactive">Show inactive categories</Label>
        </div>
        
        <Button onClick={handleAddCategory}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>
      
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCategories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                  No categories found. Add your first category to get started.
                </TableCell>
              </TableRow>
            ) : (
              filteredCategories.map(category => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>{category.description || "—"}</TableCell>
                  <TableCell>{category.order_index}</TableCell>
                  <TableCell>
                    {category.active ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-gray-50 text-gray-500 border-gray-200">
                        Inactive
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleMoveCategory(category.id, 'up')}
                        disabled={categories.indexOf(category) === 0}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleMoveCategory(category.id, 'down')}
                        disabled={categories.indexOf(category) === categories.length - 1}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEditCategory(category)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(category.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
      
      {/* Category Edit/Create Dialog */}
      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Category' : 'Create Category'}</DialogTitle>
            <DialogDescription>
              {isEditing 
                ? 'Update the category details below.' 
                : 'Fill in the details to create a new category.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="category-name">Name</Label>
              <Input 
                id="category-name" 
                value={categoryName} 
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="Category name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category-description">Description (optional)</Label>
              <Textarea 
                id="category-description" 
                value={categoryDescription} 
                onChange={(e) => setCategoryDescription(e.target.value)}
                placeholder="Brief description of this category"
                rows={3}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="category-active"
                checked={categoryActive}
                onCheckedChange={(checked) => setCategoryActive(checked === true)}
              />
              <Label htmlFor="category-active">Active</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setCategoryDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveCategory}>
              {isEditing ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this category? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 