"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useStore } from "../store-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { formatCurrency } from "@/lib/utils"
import { MinusIcon, PlusIcon, TrashIcon } from "lucide-react"

export default function CartPage() {
  const { 
    cartItems, 
    removeFromCart, 
    updateCartItemQuantity,
    cartTotal,
    minecraftUsername,
    setMinecraftUsername
  } = useStore()
  
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  
  const handleQuantityChange = (itemId: number, newQuantity: number) => {
    updateCartItemQuantity(itemId, newQuantity)
  }
  
  const handleRemoveItem = (itemId: number) => {
    removeFromCart(itemId)
  }
  
  const handleCheckout = async () => {
    if (!minecraftUsername) {
      alert("Please enter your Minecraft username")
      return
    }
    
    if (cartItems.length === 0) {
      alert("Your cart is empty")
      return
    }
    
    setCheckoutLoading(true)
    
    try {
      // TODO: Implement checkout API call
      alert("Checkout functionality will be implemented in the future")
    } catch (error) {
      console.error("Checkout error:", error)
      alert("An error occurred during checkout. Please try again later.")
    } finally {
      setCheckoutLoading(false)
    }
  }
  
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold tracking-tight">Shopping Cart</h1>
      
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 p-12">
              <p className="mb-4 text-lg text-muted-foreground">Your cart is empty</p>
              <Button asChild>
                <Link href="/store/items">Browse Items</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((cartItem) => {
                const { item, quantity, paymentMethodId } = cartItem
                const hasDiscount = item.sale_price !== null && item.sale_price < item.price
                const displayPrice = hasDiscount ? item.sale_price! : item.price
                const itemTotal = displayPrice * quantity
                
                return (
                  <Card key={item.id} className="overflow-hidden">
                    <div className="flex flex-col sm:flex-row">
                      {/* Item Image */}
                      <div className="relative h-32 w-full sm:h-auto sm:w-32">
                        {item.image_url ? (
                          <Image
                            src={item.image_url}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-slate-200">
                            <span className="text-slate-400">No image</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Item Details */}
                      <div className="flex flex-1 flex-col p-4">
                        <div className="flex justify-between">
                          <Link href={`/store/items/${item.id}`} className="hover:underline">
                            <h3 className="font-medium">{item.name}</h3>
                          </Link>
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                        
                        <p className="mt-1 text-sm text-muted-foreground">
                          {item.description.length > 100
                            ? `${item.description.substring(0, 100)}...`
                            : item.description}
                        </p>
                        
                        <div className="mt-auto flex items-center justify-between pt-4">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleQuantityChange(item.id, quantity - 1)}
                              className="flex h-6 w-6 items-center justify-center rounded-full border border-input hover:bg-muted"
                              disabled={quantity <= 1}
                            >
                              <MinusIcon className="h-3 w-3" />
                            </button>
                            <span className="w-8 text-center">{quantity}</span>
                            <button
                              onClick={() => handleQuantityChange(item.id, quantity + 1)}
                              className="flex h-6 w-6 items-center justify-center rounded-full border border-input hover:bg-muted"
                            >
                              <PlusIcon className="h-3 w-3" />
                            </button>
                          </div>
                          
                          <div className="text-right">
                            {hasDiscount && (
                              <p className="text-sm text-muted-foreground line-through">
                                {formatCurrency(item.price)}
                              </p>
                            )}
                            <p className="font-medium">
                              {quantity > 1
                                ? `${formatCurrency(displayPrice)} x ${quantity}`
                                : formatCurrency(displayPrice)}
                            </p>
                            {quantity > 1 && (
                              <p className="text-sm font-bold">
                                {formatCurrency(itemTotal)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
        
        {/* Order Summary */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(cartTotal)}</span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>{formatCurrency(cartTotal)}</span>
                </div>
                
                <div className="pt-4">
                  <Label htmlFor="minecraft-username">Minecraft Username</Label>
                  <Input
                    id="minecraft-username"
                    placeholder="Enter your Minecraft username"
                    value={minecraftUsername}
                    onChange={(e) => setMinecraftUsername(e.target.value)}
                    className="mt-1"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Your items will be applied to this Minecraft account.
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleCheckout}
                disabled={checkoutLoading || cartItems.length === 0 || !minecraftUsername}
                className="w-full"
                size="lg"
              >
                {checkoutLoading ? "Processing..." : "Proceed to Checkout"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
} 