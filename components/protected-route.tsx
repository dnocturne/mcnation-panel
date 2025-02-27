"use client"

import { useAuth } from "@/lib/auth-store"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function ProtectedRoute(props: P) {
    const [isMounted, setIsMounted] = useState(false)
    const { isAuthenticated } = useAuth()
    const router = useRouter()

    useEffect(() => {
      setIsMounted(true)
    }, [])

    useEffect(() => {
      if (isMounted) {
        const authStatus = isAuthenticated()
        console.log('Protected route auth status:', authStatus)
        
        if (!authStatus) {
          console.log('Redirecting to login from protected route')
          router.replace("/login")
        }
      }
    }, [isMounted, isAuthenticated, router])

    if (!isMounted) {
      return null // Return loading state until mounted
    }

    if (!isAuthenticated()) {
      return null // User not authenticated
    }

    return <Component {...props} />
  }
} 