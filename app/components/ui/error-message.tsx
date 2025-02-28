"use client"

import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCw } from "lucide-react"
import { ReactNode } from "react"

interface ErrorMessageProps {
  title?: string
  message: string
  retryAction?: () => void
  actionText?: string
  children?: ReactNode
}

export function ErrorMessage({
  title = "Error",
  message,
  retryAction,
  actionText = "Retry",
  children
}: ErrorMessageProps) {
  return (
    <div className="flex flex-col items-center text-center p-6 border border-destructive/20 rounded-lg bg-destructive/5">
      <AlertCircle className="h-10 w-10 text-destructive mb-4" />
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-md mb-4">{message}</p>
      {children}
      {retryAction && (
        <Button
          variant="outline"
          size="sm"
          onClick={retryAction}
          className="mt-4"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          {actionText}
        </Button>
      )}
    </div>
  )
} 