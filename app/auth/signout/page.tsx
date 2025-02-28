"use client"

import { useState, useEffect } from "react"
import { signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function SignOutPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignOut = async () => {
    setIsLoading(true)
    await signOut({ redirect: false })
    router.push("/")
  }

  const handleCancel = () => {
    router.back()
  }

  return (
    <div className="container mx-auto flex h-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Sign Out
          </h1>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to sign out?
          </p>
        </div>
        
        <div className="space-y-4">
          <Button 
            onClick={handleSignOut} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Signing out..." : "Sign Out"}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleCancel}
            className="w-full"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
} 