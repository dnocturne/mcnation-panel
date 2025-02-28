"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle } from "lucide-react"

interface LoginFormProps {
  redirectPath: string
}

export default function LoginForm({ redirectPath }: LoginFormProps) {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
        callbackUrl: redirectPath,
      })

      if (result?.error) {
        setError("Invalid username or password")
        setIsLoading(false)
        return
      }

      // Redirect to the intended destination
      router.push(redirectPath)
      router.refresh()
    } catch (error) {
      setError("An unexpected error occurred. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <div className="grid gap-6">
      <form onSubmit={handleSubmit}>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              placeholder="admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              autoFocus
              disabled={isLoading}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <p>{error}</p>
              </div>
            </div>
          )}

          <Button type="submit" disabled={isLoading} className="mt-2">
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </div>
      </form>

      <div className="mt-4 text-center text-sm">
        <p className="text-muted-foreground">
          Test credentials:
        </p>
        <p className="text-muted-foreground">
          <strong>Admin:</strong> username: admin / password: admin
        </p>
        <p className="text-muted-foreground">
          <strong>User:</strong> username: user / password: user
        </p>
      </div>
    </div>
  )
} 