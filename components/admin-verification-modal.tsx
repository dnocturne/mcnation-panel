"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { AlertCircle, Loader2, ShieldCheck } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { formatDistanceToNow } from "date-fns"
import { useAdminVerification } from "@/lib/context/admin-verification-context"

interface AdminVerificationModalProps {
  isOpen: boolean
  onClose: () => void
  onVerified: () => void
}

export function AdminVerificationModal({
  isOpen,
  onClose,
  onVerified,
}: AdminVerificationModalProps) {
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const { verifyAdminPassword } = useAuth()
  const { lastVerificationTime, timeRemaining } = useAdminVerification()
  
  // Format time since last verification
  const getLastVerifiedText = () => {
    if (!lastVerificationTime) return null
    
    return `Last verified ${formatDistanceToNow(lastVerificationTime, { addSuffix: true })}`;
  }
  
  // Format time remaining
  const getTimeRemainingText = () => {
    const remaining = timeRemaining();
    if (remaining <= 0) return null;
    
    const minutes = Math.floor(remaining / (60 * 1000));
    return `Valid for ${minutes} more minute${minutes !== 1 ? 's' : ''}`;
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password.trim()) {
      setError("Password is required")
      return
    }
    
    setIsLoading(true)
    setError(null)

    try {
      const result = await verifyAdminPassword(password)

      if (!result.success) {
        setError(result.error || "Password verification failed")
        setIsLoading(false)
        return
      }

      // Successfully verified
      toast({
        title: "Admin Access Verified",
        description: "You now have access to admin features",
      })
      onVerified()
      onClose()
    } catch (error) {
      console.error("Verification error:", error)
      setError("An unexpected error occurred during verification")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Verify Admin Access</DialogTitle>
          <DialogDescription>
            Please re-enter your password to access admin features
            {lastVerificationTime && (
              <p className="mt-1 text-xs text-muted-foreground">
                {getLastVerifiedText()}{" "}
                {getTimeRemainingText() && `• ${getTimeRemainingText()}`}
              </p>
            )}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleVerify} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="verify-password">Password</Label>
            <Input
              id="verify-password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoFocus
            />
          </div>

          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <p>{error}</p>
              </div>
            </div>
          )}

          <DialogFooter className="sm:justify-between">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  Verify
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 