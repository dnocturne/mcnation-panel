"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { NavigationMenuDemo } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-store"
import type { AuthState } from "@/lib/auth-store"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const setToken = useAuth((state: AuthState) => state.setToken)

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    setIsLoading(true)

    try {
      const requestData = { username, password };
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || "Login failed")
      }

      setToken(data.token, data.username)
      router.push("/admin")
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Login failed",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background relative">
      <NavigationMenuDemo />
      <div className="absolute inset-0 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>
              Enter your Minecraft username and password to continue
            </CardDescription>
          </CardHeader>
          <form onSubmit={onSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="Enter your Minecraft username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
} 