"use client"

import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  if (status === "loading") {
    return <div className="flex h-screen items-center justify-center">Loading...</div>
  }
  
  if (!session) {
    return (
      <div className="flex h-screen flex-col items-center justify-center space-y-4">
        <h1 className="text-2xl font-bold">Not Signed In</h1>
        <p>You need to sign in to view your profile</p>
        <Button onClick={() => router.push("/auth/login?redirect=/profile")}>
          Sign In
        </Button>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto py-10">
      <div className="rounded-lg border p-8 shadow-sm">
        <h1 className="mb-6 text-3xl font-bold">Your Profile</h1>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Name</p>
            <p className="font-medium">{session.user.name || "Not set"}</p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-medium">{session.user.email || "Not set"}</p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Role</p>
            <p className="font-medium">{session.user.role}</p>
          </div>
        </div>
        
        <div className="mt-8 flex space-x-4">
          <Button variant="outline" asChild>
            <Link href="/">Back to Home</Link>
          </Button>
          
          <Button variant="outline" asChild>
            <Link href="/auth/signout">Sign Out</Link>
          </Button>
          
          {session.user.role === "admin" && (
            <Button asChild>
              <Link href="/admin/store/discounts">Admin Dashboard</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
} 