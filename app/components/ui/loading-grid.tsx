"use client"

import { Skeleton } from "@/components/ui/skeleton"

interface LoadingGridProps {
  count?: number
  columns?: {
    sm?: number
    md?: number
    lg?: number
  }
  height?: number
}

export function LoadingGrid({ 
  count = 3, 
  columns = { sm: 1, md: 2, lg: 3 },
  height = 120
}: LoadingGridProps) {
  return (
    <div className={`grid gap-4 grid-cols-${columns.sm} md:grid-cols-${columns.md} lg:grid-cols-${columns.lg}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className={`w-full h-${height} rounded-lg`} />
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
} 