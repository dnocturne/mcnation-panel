import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
  fullHeight?: boolean
  text?: string
}

export function LoadingSpinner({
  size = "md",
  className,
  fullHeight = false,
  text
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12"
  }

  return (
    <div className={cn(
      "flex flex-col items-center justify-center",
      fullHeight ? "h-full min-h-48" : "h-48",
      className
    )}>
      <Loader2 className={cn(
        "animate-spin text-muted-foreground",
        sizeClasses[size]
      )} />
      {text && (
        <p className="mt-2 text-sm text-muted-foreground">{text}</p>
      )}
    </div>
  )
} 