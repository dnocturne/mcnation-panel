"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-store"
import { PlusCircle, Edit, Trash2, Calendar } from "lucide-react"
import { format } from "date-fns"

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
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

// Define types
interface Discount {
  id: number
  code: string
  percentage: number
  valid_from: string
  valid_until: string | null
  max_uses: number | null
  times_used: number
  active: boolean
}

// Form schema
const discountSchema = z.object({
  code: z.string().min(1, "Discount code is required"),
  percentage: z.coerce.number().min(1).max(100, "Percentage must be between 1 and 100"),
  valid_from: z.date(),
  valid_until: z.date().nullable(),
  max_uses: z.coerce.number().nullable(),
  active: z.boolean().default(true)
});

type DiscountFormValues = z.infer<typeof discountSchema>;

export default function DiscountsList() {
  const { token } = useAuth()
  const [discounts, setDiscounts] = useState<Discount[]>([])
  const [loading, setLoading] = useState(true)
  const [showInactive, setShowInactive] = useState(false)
  const [showExpired, setShowExpired] = useState(false)
  
  // Dialog states
  const [isEditing, setIsEditing] = useState(false)
  const [editDiscount, setEditDiscount] = useState<Discount | null>(null)
  const [discountDialogOpen, setDiscountDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteDiscountId, setDeleteDiscountId] = useState<number | null>(null)
  
  // Form setup
  const form = useForm<DiscountFormValues>({
    resolver: zodResolver(discountSchema),
    defaultValues: {
      code: "",
      percentage: 10,
      valid_from: new Date(),
      valid_until: null,
      max_uses: null,
      active: true
    }
  });
  
  // Fetch discounts
  useEffect(() => {
    const fetchDiscounts = async () => {
      try {
        const res = await fetch('/api/webstore/discounts')
        
        if (!res.ok) {
          throw new Error('Failed to fetch discounts')
        }
        
        const data = await res.json()
        setDiscounts(data)
      } catch (error) {
        console.error('Error fetching discounts:', error)
        toast({
          title: "Error",
          description: "Failed to load discounts. Please try again.",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }
    
    fetchDiscounts()
  }, [])
  
  // Reset form
  const resetForm = () => {
    setIsEditing(false)
    setEditDiscount(null)
    form.reset({
      code: "",
      percentage: 10,
      valid_from: new Date(),
      valid_until: null,
      max_uses: null,
      active: true
    })
  }
  
  // Open discount dialog for creating
  const handleAddDiscount = () => {
    resetForm()
    setDiscountDialogOpen(true)
  }
  
  // Open discount dialog for editing
  const handleEditDiscount = (discount: Discount) => {
    setIsEditing(true)
    setEditDiscount(discount)
    
    form.reset({
      code: discount.code,
      percentage: discount.percentage,
      valid_from: discount.valid_from ? new Date(discount.valid_from) : new Date(),
      valid_until: discount.valid_until ? new Date(discount.valid_until) : null,
      max_uses: discount.max_uses,
      active: discount.active
    })
    
    setDiscountDialogOpen(true)
  }
  
  // Handle discount save (create or update)
  const onSubmit = async (values: DiscountFormValues) => {
    try {
      if (isEditing && editDiscount) {
        // Update existing discount
        const res = await fetch(`/api/webstore/discounts/${editDiscount.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            ...values,
            valid_from: values.valid_from.toISOString(),
            valid_until: values.valid_until ? values.valid_until.toISOString() : null
          })
        })
        
        if (!res.ok) {
          throw new Error('Failed to update discount')
        }
        
        // Update local state
        setDiscounts(discounts.map(d => 
          d.id === editDiscount.id 
            ? { 
                ...d, 
                code: values.code,
                percentage: values.percentage,
                valid_from: values.valid_from.toISOString(),
                valid_until: values.valid_until ? values.valid_until.toISOString() : null,
                max_uses: values.max_uses,
                active: values.active
              } 
            : d
        ))
        
        toast({
          title: "Success",
          description: "Discount updated successfully."
        })
      } else {
        // Create new discount
        const res = await fetch('/api/webstore/discounts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            ...values,
            valid_from: values.valid_from.toISOString(),
            valid_until: values.valid_until ? values.valid_until.toISOString() : null
          })
        })
        
        if (!res.ok) {
          throw new Error('Failed to create discount')
        }
        
        const newDiscount = await res.json()
        
        // Add to local state
        setDiscounts([...discounts, newDiscount])
        
        toast({
          title: "Success",
          description: "Discount created successfully."
        })
      }
      
      // Close dialog and reset form
      setDiscountDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error('Error saving discount:', error)
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? 'update' : 'create'} discount. Please try again.`,
        variant: "destructive"
      })
    }
  }
  
  // Open delete confirmation dialog
  const handleDeleteClick = (id: number) => {
    setDeleteDiscountId(id)
    setDeleteDialogOpen(true)
  }
  
  // Handle discount deletion
  const confirmDelete = async () => {
    if (!deleteDiscountId) return
    
    try {
      const res = await fetch(`/api/webstore/discounts/${deleteDiscountId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      
      if (!res.ok) {
        throw new Error('Failed to delete discount')
      }
      
      // Update local state
      setDiscounts(discounts.filter(d => d.id !== deleteDiscountId))
      
      toast({
        title: "Success",
        description: "Discount deleted successfully."
      })
    } catch (error) {
      console.error('Error deleting discount:', error)
      toast({
        title: "Error",
        description: "Failed to delete discount. Please try again.",
        variant: "destructive"
      })
    } finally {
      setDeleteDialogOpen(false)
      setDeleteDiscountId(null)
    }
  }
  
  // Toggle filters
  const toggleShowInactive = () => setShowInactive(!showInactive)
  const toggleShowExpired = () => setShowExpired(!showExpired)
  
  // Check if a discount is expired
  const isDiscountExpired = (discount: Discount) => {
    if (!discount.valid_until) return false
    return new Date(discount.valid_until) < new Date()
  }
  
  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—"
    return format(new Date(dateString), "PPP")
  }
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }
  
  // Filter discounts
  const filteredDiscounts = discounts.filter(discount => {
    if (!showInactive && !discount.active) return false
    if (!showExpired && isDiscountExpired(discount)) return false
    return true
  })
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="showInactive"
              checked={showInactive}
              onCheckedChange={toggleShowInactive}
            />
            <Label htmlFor="showInactive">Show inactive</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="showExpired"
              checked={showExpired}
              onCheckedChange={toggleShowExpired}
            />
            <Label htmlFor="showExpired">Show expired</Label>
          </div>
        </div>
        
        <Button onClick={handleAddDiscount}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Discount
        </Button>
      </div>
      
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Valid Period</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDiscounts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                  No discounts found. Add your first discount to get started.
                </TableCell>
              </TableRow>
            ) : (
              filteredDiscounts.map(discount => (
                <TableRow key={discount.id}>
                  <TableCell className="font-medium uppercase">{discount.code}</TableCell>
                  <TableCell>{discount.percentage}% off</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>From: {formatDate(discount.valid_from)}</div>
                      <div>Until: {formatDate(discount.valid_until)}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {discount.times_used} / {discount.max_uses || "∞"}
                  </TableCell>
                  <TableCell>
                    {!discount.active ? (
                      <Badge variant="outline" className="bg-gray-50 text-gray-500 border-gray-200">
                        Inactive
                      </Badge>
                    ) : isDiscountExpired(discount) ? (
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                        Expired
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Active
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEditDiscount(discount)}>
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(discount.id)}>
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
      
      {/* Discount Edit/Create Dialog */}
      <Dialog open={discountDialogOpen} onOpenChange={setDiscountDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Discount' : 'Create Discount'}</DialogTitle>
            <DialogDescription>
              {isEditing 
                ? 'Update the discount details below.' 
                : 'Fill in the details to create a new discount code.'}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discount Code</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. SUMMER20"
                        {...field}
                        className="uppercase"
                      />
                    </FormControl>
                    <FormDescription>
                      This is the code customers will enter at checkout.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="percentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discount Percentage</FormLabel>
                    <FormControl>
                      <div className="flex items-center">
                        <Input
                          type="number"
                          min={1}
                          max={100}
                          {...field}
                          className="w-24"
                        />
                        <span className="ml-2">%</span>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Percentage off the total purchase (1-100).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="valid_from"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Valid From</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className="justify-start text-left font-normal"
                            >
                              <Calendar className="mr-2 h-4 w-4" />
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <CalendarComponent
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="valid_until"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Valid Until (Optional)</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className="justify-start text-left font-normal"
                            >
                              <Calendar className="mr-2 h-4 w-4" />
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>No end date</span>
                              )}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <CalendarComponent
                            mode="single"
                            selected={field.value ?? undefined}
                            onSelect={field.onChange}
                            initialFocus
                            disabled={(date) => 
                              date < form.getValues("valid_from") || 
                              date < new Date()
                            }
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="max_uses"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Uses (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Unlimited"
                        min={1}
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => {
                          const value = e.target.value === "" ? null : parseInt(e.target.value, 10)
                          field.onChange(value)
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Leave empty for unlimited uses.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Active
                      </FormLabel>
                      <FormDescription>
                        Inactive discounts cannot be used even if they are within the valid date range.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setDiscountDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {isEditing ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Discount</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this discount? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete Discount
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 