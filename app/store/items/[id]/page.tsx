"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { useStore } from "../../store-context"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { formatCurrency } from "@/lib/utils"

interface PaymentMethod {
  id: number
  name: string
}

interface StoreItem {
  id: number
  name: string
  description: string
  price: number
  sale_price: number | null
  category_id: number | null
  image_url: string | null
  active: boolean
  category_name?: string
  payment_methods?: PaymentMethod[]
}

export default function StoreItemPage({ params }: { params: { id: string } }) {
  const [item, setItem] = useState<StoreItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<number | null>(null)
  
  const { addToCart } = useStore()
  
  const itemId = parseInt(params.id)
  
  useEffect(() => {
    async function fetchItem() {
      try {
        setLoading(true)
        const res = await fetch(`/api/webstore/items/${itemId}`)
        
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error('Item not found')
          }
          throw new Error('Failed to fetch item')
        }
        
        const data = await res.json()
        setItem(data)
        
        // Set default payment method if available
        if (data.payment_methods && data.payment_methods.length > 0) {
          setSelectedPaymentMethod(data.payment_methods[0].id)
        }
      } catch (error) {
        console.error('Error fetching item:', error)
        setError((error as Error).message)
      } finally {
        setLoading(false)
      }
    }
    
    fetchItem()
  }, [itemId])
  
  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">Loading item...</p>
        </div>
      </div>
    )
  }
  
  if (error || !item) {
    if (error === 'Item not found') {
      return notFound()
    }
    
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">
            {error || 'Failed to load item'}
          </p>
          <Button className="mt-4" asChild>
            <Link href="/store/items">Back to Items</Link>
          </Button>
        </div>
      </div>
    )
  }
  
  const hasDiscount = item.sale_price !== null && item.sale_price < item.price
  const displayPrice = hasDiscount ? item.sale_price! : item.price
  
  const handleAddToCart = () => {
    if (!selectedPaymentMethod) {
      alert('Please select a payment method')
      return
    }
    
    addToCart(item, selectedPaymentMethod)
    alert('Item added to cart')
  }
  
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Item Image */}
        <div>
          <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-slate-100">
            {item.image_url ? (
              <Image
                src={item.image_url}
                alt={item.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-slate-200">
                <span className="text-slate-400">No image</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Item Details */}
        <div>
          <div className="flex flex-col space-y-3">
            {item.category_name && (
              <Badge variant="outline" className="w-fit">
                {item.category_name}
              </Badge>
            )}
            <h1 className="text-3xl font-bold">{item.name}</h1>
            
            <div className="flex items-center gap-2">
              {hasDiscount ? (
                <>
                  <span className="text-2xl font-bold text-primary">
                    {formatCurrency(displayPrice)}
                  </span>
                  <span className="text-lg text-muted-foreground line-through">
                    {formatCurrency(item.price)}
                  </span>
                </>
              ) : (
                <span className="text-2xl font-bold">
                  {formatCurrency(displayPrice)}
                </span>
              )}
            </div>
            
            <Separator />
            
            <div className="prose max-w-none">
              <p>{item.description}</p>
            </div>
            
            <Separator />
            
            {/* Payment Methods */}
            {item.payment_methods && item.payment_methods.length > 0 ? (
              <Card>
                <CardContent className="p-6">
                  <h3 className="mb-4 text-lg font-medium">Select Payment Method</h3>
                  <RadioGroup
                    value={selectedPaymentMethod?.toString()}
                    onValueChange={(value: string) => setSelectedPaymentMethod(parseInt(value))}
                  >
                    {item.payment_methods.map((method) => (
                      <div key={method.id} className="flex items-center space-x-2">
                        <RadioGroupItem value={method.id.toString()} id={`method-${method.id}`} />
                        <Label htmlFor={`method-${method.id}`}>{method.name}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </CardContent>
              </Card>
            ) : (
              <p className="text-sm text-muted-foreground">No payment methods available for this item</p>
            )}
            
            <Button size="lg" onClick={handleAddToCart} disabled={!selectedPaymentMethod}>
              Add to Cart
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 