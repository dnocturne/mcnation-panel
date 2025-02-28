"use client"

import { usePermission } from "@/hooks/use-permissions"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { AdminVerificationWrapper } from "@/components/admin-verification-wrapper"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export function StoreAdminClient({ children }: { children: React.ReactNode }) {
  const { data: hasPermission, isLoading } = usePermission('panel.webstore')
  const router = useRouter()
  
  useEffect(() => {
    if (!isLoading && hasPermission === false) {
      router.push('/admin')
    }
  }, [hasPermission, isLoading, router])
  
  if (isLoading) {
    return <LoadingSpinner text="Checking store permissions..." />
  }
  
  if (!hasPermission) {
    return <LoadingSpinner text="Access denied. Redirecting..." />
  }
  
  return (
    <AdminVerificationWrapper>
      {children}
    </AdminVerificationWrapper>
  )
} 