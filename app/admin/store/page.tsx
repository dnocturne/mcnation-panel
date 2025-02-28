'use client'

import { redirect } from "next/navigation"
import { useEffect, useState } from "react"

export default function StorePage() {
  const [shouldRedirect, setShouldRedirect] = useState(false)
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldRedirect(true)
    }, 500)
    
    return () => clearTimeout(timer)
  }, [])
  
  if (shouldRedirect) {
    redirect("/admin/store/items")
  }
  
  return (
    <div className="flex justify-center items-center h-48">
      <p>Redirecting to items page...</p>
    </div>
  )
} 