"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-store"
import { PlusCircle, Edit, Trash2 } from "lucide-react"

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
interface PaymentMethod {
  id: number
  name: string
  description: string | null
  active: boolean
}

export default function PaymentMethodsList() {
  const { token } = useAuth()
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [loading, setLoading] = useState(true)
  const [showInactive, setShowInactive] = useState(false)
  
  // Dialog states
  const [isEditing, setIsEditing] = useState(false)
  const [editMethod, setEditMethod] = useState<PaymentMethod | null>(null)
  const [methodDialogOpen, setMethodDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteMethodId, setDeleteMethodId] = useState<number | null>(null)
  
  // Form states
  const [methodName, setMethodName] = useState("")
  const [methodDescription, setMethodDescription] = useState("")
  const [methodActive, setMethodActive] = useState(true)
  
  // Fetch payment methods
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const res = await fetch('/api/webstore/payment-methods')
        
        if (!res.ok) {
          throw new Error('Failed to fetch payment methods')
        }
        
        const data = await res.json()
        setPaymentMethods(data)
      } catch (error) {
        console.error('Error fetching payment methods:', error)
        toast({
          title: "Error",
          description: "Failed to load payment methods. Please try again.",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }
    
    fetchPaymentMethods()
  }, [])
  
  // Reset form
  const resetForm = () => {
    setIsEditing(false)
    setEditMethod(null)
    setMethodName("")
    setMethodDescription("")
    setMethodActive(true)
  }
  
  // Open payment method dialog for creating
  const handleAddMethod = () => {
    resetForm()
    setMethodDialogOpen(true)
  }
  
  // Open payment method dialog for editing
  const handleEditMethod = (method: PaymentMethod) => {
    setIsEditing(true)
    setEditMethod(method)
    setMethodName(method.name)
    setMethodDescription(method.description || "")
    setMethodActive(method.active)
    setMethodDialogOpen(true)
  }
  
  // Handle payment method save (create or update)
  const handleSaveMethod = async () => {
    if (!methodName.trim()) {
      toast({
        title: "Error",
        description: "Payment method name is required.",
        variant: "destructive"
      })
      return
    }
    
    try {
      if (isEditing && editMethod) {
        // Update existing payment method
        const res = await fetch(`/api/webstore/payment-methods/${editMethod.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            name: methodName,
            description: methodDescription || null,
            active: methodActive
          })
        })
        
        if (!res.ok) {
          throw new Error('Failed to update payment method')
        }
        
        // Update local state
        setPaymentMethods(paymentMethods.map(m => 
          m.id === editMethod.id 
            ? { 
                ...m, 
                name: methodName, 
                description: methodDescription || null,
                active: methodActive
              } 
            : m
        ))
        
        toast({
          title: "Success",
          description: "Payment method updated successfully."
        })
      } else {
        // Create new payment method
        const res = await fetch('/api/webstore/payment-methods', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            name: methodName,
            description: methodDescription || null,
            active: methodActive
          })
        })
        
        if (!res.ok) {
          throw new Error('Failed to create payment method')
        }
        
        const newMethod = await res.json()
        
        // Add to local state
        setPaymentMethods([...paymentMethods, newMethod])
        
        toast({
          title: "Success",
          description: "Payment method created successfully."
        })
      }
      
      // Close dialog and reset form
      setMethodDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error('Error saving payment method:', error)
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? 'update' : 'create'} payment method. Please try again.`,
        variant: "destructive"
      })
    }
  }
  
  // Open delete confirmation dialog
  const handleDeleteClick = (id: number) => {
    setDeleteMethodId(id)
    setDeleteDialogOpen(true)
  }
  
  // Handle payment method deletion
  const confirmDelete = async () => {
    if (!deleteMethodId) return
    
    try {
      const res = await fetch(`/api/webstore/payment-methods/${deleteMethodId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      
      if (!res.ok) {
        throw new Error('Failed to delete payment method')
      }
      
      // Update local state
      setPaymentMethods(paymentMethods.filter(m => m.id !== deleteMethodId))
      
      toast({
        title: "Success",
        description: "Payment method deleted successfully."
      })
    } catch (error) {
      console.error('Error deleting payment method:', error)
      toast({
        title: "Error",
        description: "Failed to delete payment method. Please try again.",
        variant: "destructive"
      })
    } finally {
      setDeleteDialogOpen(false)
      setDeleteMethodId(null)
    }
  }
  
  // Toggle showing inactive payment methods
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
  
  // Filter payment methods if needed
  const filteredMethods = showInactive 
    ? paymentMethods 
    : paymentMethods.filter(m => m.active)
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="showInactive"
            checked={showInactive}
            onCheckedChange={toggleShowInactive}
          />
          <Label htmlFor="showInactive">Show inactive payment methods</Label>
        </div>
        
        <Button onClick={handleAddMethod}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Payment Method
        </Button>
      </div>
      
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMethods.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                  No payment methods found. Add your first payment method to get started.
                </TableCell>
              </TableRow>
            ) : (
              filteredMethods.map(method => (
                <TableRow key={method.id}>
                  <TableCell className="font-medium">{method.name}</TableCell>
                  <TableCell>{method.description || "—"}</TableCell>
                  <TableCell>
                    {method.active ? (
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
                    <div className="flex justify-end space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEditMethod(method)}>
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(method.id)}>
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
      
      {/* Payment Method Edit/Create Dialog */}
      <Dialog open={methodDialogOpen} onOpenChange={setMethodDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Payment Method' : 'Create Payment Method'}</DialogTitle>
            <DialogDescription>
              {isEditing 
                ? 'Update the payment method details below.' 
                : 'Fill in the details to create a new payment method.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="method-name">Name</Label>
              <Input 
                id="method-name" 
                value={methodName} 
                onChange={(e) => setMethodName(e.target.value)}
                placeholder="Payment method name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="method-description">Description (optional)</Label>
              <Textarea 
                id="method-description" 
                value={methodDescription} 
                onChange={(e) => setMethodDescription(e.target.value)}
                placeholder="Brief description of this payment method"
                rows={3}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="method-active"
                checked={methodActive}
                onCheckedChange={(checked) => setMethodActive(checked === true)}
              />
              <Label htmlFor="method-active">Active</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setMethodDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveMethod}>
              {isEditing ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Payment Method</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this payment method? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete Payment Method
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 