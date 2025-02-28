"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"

type Theme = "dark" | "light" | "system"

interface AppContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  isMobile: boolean
  isSidebarOpen: boolean
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("system")
  const [isMobile, setIsMobile] = useState(false)
  const [isSidebarOpen, setSidebarOpen] = useState(true)
  
  // Check for mobile on mount and window resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      
      // Auto-close sidebar on mobile
      if (window.innerWidth < 768) {
        setSidebarOpen(false)
      } else {
        setSidebarOpen(true)
      }
    }
    
    // Initial check
    checkMobile()
    
    // Add event listener
    window.addEventListener("resize", checkMobile)
    
    // Clean up
    return () => window.removeEventListener("resize", checkMobile)
  }, [])
  
  // Load theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as Theme | null
    if (savedTheme) {
      setTheme(savedTheme)
    }
  }, [])
  
  // Save theme to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("theme", theme)
  }, [theme])
  
  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev)
  }
  
  return (
    <AppContext.Provider value={{
      theme,
      setTheme,
      isMobile,
      isSidebarOpen,
      toggleSidebar,
      setSidebarOpen
    }}>
      <ThemeProvider defaultTheme={theme} enableSystem>
        {children}
        <Toaster />
      </ThemeProvider>
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return context
} 