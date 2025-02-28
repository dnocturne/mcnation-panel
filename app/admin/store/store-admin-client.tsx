"use client"

import { usePermission } from "@/hooks/use-permissions"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useEffect } from "react"

export function StoreAdminClient({ children }: { children: React.ReactNode }) {
  const { data: hasPermission, isLoading } = usePermission('panel.webstore')
  const router = useRouter()
  
  useEffect(() => {
    if (!isLoading && hasPermission === false) {
      router.push('/admin')
    }
  }, [hasPermission, isLoading, router])
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }
  
  if (!hasPermission) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }
  
  return <>{children}</>
} 