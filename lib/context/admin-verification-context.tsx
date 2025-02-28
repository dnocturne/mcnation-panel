"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

// Default verification timeout is 1 hour (in milliseconds)
const DEFAULT_VERIFICATION_TIMEOUT = 60 * 60 * 1000

type AdminVerificationContextType = {
  isAdminVerified: boolean
  setAdminVerified: (verified: boolean) => void
  lastVerificationTime: number | null
  resetVerification: () => void
  timeRemaining: () => number
  verificationTimeout: number
  setVerificationTimeout: (timeout: number) => void
}

const AdminVerificationContext = createContext<AdminVerificationContextType | undefined>(undefined)

interface AdminVerificationProviderProps {
  children: ReactNode
  initialTimeout?: number // in milliseconds
}

export function AdminVerificationProvider({ 
  children, 
  initialTimeout = DEFAULT_VERIFICATION_TIMEOUT 
}: AdminVerificationProviderProps) {
  const [isAdminVerified, setIsAdminVerified] = useState(false)
  const [lastVerificationTime, setLastVerificationTime] = useState<number | null>(null)
  const [verificationTimeout, setVerificationTimeout] = useState<number>(initialTimeout)

  // Load verification state from localStorage on mount
  useEffect(() => {
    const savedVerification = localStorage.getItem("adminVerification")
    if (savedVerification) {
      try {
        const parsed = JSON.parse(savedVerification)
        const verificationTime = parsed.time
        const savedTimeout = parsed.timeout || DEFAULT_VERIFICATION_TIMEOUT
        
        setVerificationTimeout(savedTimeout)
        
        // Check if verification is still valid based on the timeout
        const isStillValid = verificationTime && (Date.now() - verificationTime < savedTimeout)
        
        if (isStillValid) {
          setIsAdminVerified(true)
          setLastVerificationTime(verificationTime)
        } else {
          // Clear expired verification
          localStorage.removeItem("adminVerification")
        }
      } catch (error) {
        console.error("Error parsing admin verification data:", error)
        localStorage.removeItem("adminVerification")
      }
    }
  }, [])

  const setAdminVerified = (verified: boolean) => {
    setIsAdminVerified(verified)
    
    if (verified) {
      const time = Date.now()
      setLastVerificationTime(time)
      localStorage.setItem("adminVerification", JSON.stringify({ 
        verified, 
        time,
        timeout: verificationTimeout 
      }))
    } else {
      setLastVerificationTime(null)
      localStorage.removeItem("adminVerification")
    }
  }

  const resetVerification = () => {
    setIsAdminVerified(false)
    setLastVerificationTime(null)
    localStorage.removeItem("adminVerification")
  }
  
  const timeRemaining = (): number => {
    if (!lastVerificationTime || !isAdminVerified) {
      return 0
    }
    
    const elapsed = Date.now() - lastVerificationTime
    const remaining = Math.max(0, verificationTimeout - elapsed)
    
    // If time expired but state hasn't been updated yet, reset the verification
    if (remaining === 0 && isAdminVerified) {
      resetVerification()
    }
    
    return remaining
  }

  const updateTimeout = (timeout: number) => {
    setVerificationTimeout(timeout)
    
    // Update in localStorage if verified
    if (isAdminVerified && lastVerificationTime) {
      localStorage.setItem("adminVerification", JSON.stringify({ 
        verified: true, 
        time: lastVerificationTime,
        timeout 
      }))
    }
  }

  return (
    <AdminVerificationContext.Provider 
      value={{ 
        isAdminVerified, 
        setAdminVerified, 
        lastVerificationTime,
        resetVerification,
        timeRemaining,
        verificationTimeout,
        setVerificationTimeout: updateTimeout
      }}
    >
      {children}
    </AdminVerificationContext.Provider>
  )
}

export function useAdminVerification() {
  const context = useContext(AdminVerificationContext)
  if (context === undefined) {
    throw new Error("useAdminVerification must be used within an AdminVerificationProvider")
  }
  return context
} 