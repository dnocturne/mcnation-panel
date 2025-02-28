"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { StoreItem, CartItem, StoreContext as StoreContextType } from "@/lib/types/store"

const StoreContext = createContext<StoreContextType | undefined>(undefined)

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [cartTotal, setCartTotal] = useState(0)
  const [cartCount, setCartCount] = useState(0)
  const [minecraftUsername, setMinecraftUsername] = useState("")
  
  // Load cart from localStorage on initial render
  useEffect(() => {
    const savedCart = localStorage.getItem("cart")
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart)
        setCartItems(parsedCart)
      } catch (error) {
        console.error("Failed to parse saved cart", error)
      }
    }
    
    const savedUsername = localStorage.getItem("minecraft_username")
    if (savedUsername) {
      setMinecraftUsername(savedUsername)
    }
  }, [])
  
  // Update localStorage when cart changes
  useEffect(() => {
    if (cartItems.length > 0) {
      localStorage.setItem("cart", JSON.stringify(cartItems))
    } else {
      localStorage.removeItem("cart")
    }
    
    // Calculate totals
    const total = cartItems.reduce((sum, cartItem) => {
      const price = cartItem.item.sale_price ?? cartItem.item.price
      return sum + (price * cartItem.quantity)
    }, 0)
    
    const count = cartItems.reduce((sum, cartItem) => sum + cartItem.quantity, 0)
    
    setCartTotal(total)
    setCartCount(count)
  }, [cartItems])
  
  // Save username to localStorage when it changes
  useEffect(() => {
    if (minecraftUsername) {
      localStorage.setItem("minecraft_username", minecraftUsername)
    } else {
      localStorage.removeItem("minecraft_username")
    }
  }, [minecraftUsername])
  
  const addToCart = (item: StoreItem, paymentMethodId: number) => {
    setCartItems(prevItems => {
      // Check if item already exists in cart
      const existingItemIndex = prevItems.findIndex(cartItem => cartItem.item.id === item.id)
      
      if (existingItemIndex >= 0) {
        // Item exists, update quantity
        const newItems = [...prevItems]
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity: newItems[existingItemIndex].quantity + 1
        }
        return newItems
      } else {
        // Item doesn't exist, add new item
        return [...prevItems, { item, quantity: 1, paymentMethodId }]
      }
    })
  }
  
  const removeFromCart = (itemId: number) => {
    setCartItems(prevItems => prevItems.filter(item => item.item.id !== itemId))
  }
  
  const updateCartItemQuantity = (itemId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId)
      return
    }
    
    setCartItems(prevItems => {
      return prevItems.map(item => {
        if (item.item.id === itemId) {
          return { ...item, quantity }
        }
        return item
      })
    })
  }
  
  const updateCartItemPaymentMethod = (itemId: number, paymentMethodId: number) => {
    setCartItems(prevItems => {
      return prevItems.map(item => {
        if (item.item.id === itemId) {
          return { ...item, paymentMethodId }
        }
        return item
      })
    })
  }
  
  const applyDiscountCode = (itemId: number, code: string) => {
    setCartItems(prevItems => {
      return prevItems.map(item => {
        if (item.item.id === itemId) {
          return { ...item, discountCode: code }
        }
        return item
      })
    })
  }
  
  const clearCart = () => {
    setCartItems([])
  }
  
  return (
    <StoreContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateCartItemQuantity,
      updateCartItemPaymentMethod,
      applyDiscountCode,
      clearCart,
      cartTotal,
      cartCount,
      minecraftUsername,
      setMinecraftUsername
    }}>
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  const context = useContext(StoreContext)
  if (context === undefined) {
    throw new Error("useStore must be used within a StoreProvider")
  }
  return context
} 