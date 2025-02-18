"use client"

import { useAuth } from "@/lib/auth-store"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function ProtectedRoute(props: P) {
    const isAuthenticated = useAuth((state) => state.isAuthenticated)
    const router = useRouter()

    useEffect(() => {
      if (!isAuthenticated()) {
        router.replace("/login")
      }
    }, [router])

    if (!isAuthenticated()) {
      return null
    }

    return <Component {...props} />
  }
} 