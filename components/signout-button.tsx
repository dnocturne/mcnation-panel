"use client"

import { Button } from "@/components/ui/button"
import { signOut } from "next-auth/react"
import { useAdminVerification } from "@/lib/context/admin-verification-context"
import { LogOut } from "lucide-react"

interface SignOutButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  showIcon?: boolean
  className?: string
}

export function SignOutButton({ 
  variant = "default", 
  size = "default",
  showIcon = true,
  className = ""
}: SignOutButtonProps) {
  const { resetVerification } = useAdminVerification()

  const handleSignOut = async () => {
    // Clear admin verification
    resetVerification()
    
    // Sign out from NextAuth
    await signOut({ callbackUrl: "/" })
  }

  return (
    <Button 
      variant={variant} 
      size={size} 
      onClick={handleSignOut}
      className={className}
    >
      {showIcon && <LogOut className="h-4 w-4 mr-2" />}
      Sign Out
    </Button>
  )
} 