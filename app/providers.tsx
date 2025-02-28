"use client"

import { SessionProvider } from "next-auth/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { ThemeProvider } from "next-themes"
import { Toaster } from "@/components/ui/toaster"
import { useState } from "react"
import { AdminVerificationProvider } from "@/lib/context/admin-verification-context"

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())
  
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <QueryClientProvider client={queryClient}>
          <AdminVerificationProvider>
            {children}
            <ReactQueryDevtools />
            <Toaster />
          </AdminVerificationProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </SessionProvider>
  )
}
