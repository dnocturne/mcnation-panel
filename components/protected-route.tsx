"use client"

import { useAuth } from "@/lib/auth-store"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function ProtectedRoute(props: P) {
    const [isMounted, setIsMounted] = useState(false)
    const isAuthenticated = useAuth((state) => state.isAuthenticated)
    const router = useRouter()

    useEffect(() => {
      setIsMounted(true)
      if (!isAuthenticated()) {
        router.replace("/login")
      }
    }, [router])

    if (!isMounted || !isAuthenticated()) {
      return null // Return loading state or null until mounted
    }

    return <Component {...props} />
  }
} 