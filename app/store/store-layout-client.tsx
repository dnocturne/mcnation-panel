"use client"

import Link from "next/link"
import { ShoppingCart, Menu, Search, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useEffect, useState } from "react"
import { usePermission } from "@/hooks/use-permissions"
import { useQuery } from "@tanstack/react-query"
import { StoreProvider } from "./store-context"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/hooks/use-auth"

export default function StoreLayoutClient({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, logout } = useAuth()
  const username = user?.name
  const router = useRouter()
  const { data: hasAdminPermission } = usePermission('panel.webstore')
  const [cartCount, setCartCount] = useState(0)
  
  // Fetch cart count
  useEffect(() => {
    if (isAuthenticated) {
      // Example - replace with actual cart API
      fetch('/api/webstore/cart/count')
        .then(res => res.ok ? res.json() : { count: 0 })
        .then(data => setCartCount(data.count))
        .catch(() => setCartCount(0))
    }
  }, [isAuthenticated])

  // Fetch user avatar
  const { data: avatarData } = useQuery({
    queryKey: ['avatar', username],
    queryFn: async () => {
      if (!username) return null
      const response = await fetch(`/api/users/${username}/avatar`)
      if (!response.ok) throw new Error('Failed to fetch avatar')
      return response.json()
    },
    enabled: !!username
  })

  // Update the logout handler
  const handleLogout = () => {
    logout("/login")
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container max-w-full flex h-16 items-center">
          <Button variant="ghost" size="icon" asChild className="mr-2">
            <Link href="/" title="Back to Main Site">
              <ChevronLeft className="h-5 w-5" />
              <span className="sr-only">Back to Main Site</span>
            </Link>
          </Button>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden mr-2">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader className="mb-4">
                <SheetTitle>Categories</SheetTitle>
                <SheetDescription>Browse by category</SheetDescription>
              </SheetHeader>
              <div className="grid gap-2 py-6">
                <Link
                  href="/store"
                  className="flex w-full items-center py-2 text-lg font-semibold"
                >
                  All Items
                </Link>
                <Link
                  href="/store/category/1"
                  className="flex w-full items-center py-2 text-lg font-semibold"
                >
                  Featured
                </Link>
                <Link
                  href="/store/category/2"
                  className="flex w-full items-center py-2 text-lg font-semibold"
                >
                  Ranks
                </Link>
                <Link
                  href="/store/category/3"
                  className="flex w-full items-center py-2 text-lg font-semibold"
                >
                  Cosmetics
                </Link>
                <Link
                  href="/store/category/4"
                  className="flex w-full items-center py-2 text-lg font-semibold"
                >
                  Gameplay
                </Link>
              </div>
            </SheetContent>
          </Sheet>

          <div className="mr-4 hidden md:flex">
            <Link href="/store" className="mr-6 flex items-center space-x-2">
              <span className="hidden font-bold sm:inline-block">
                MCNation Store
              </span>
            </Link>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link
                href="/store"
                className="transition-colors hover:text-foreground/80"
              >
                All Items
              </Link>
              <Link
                href="/store/category/1"
                className="transition-colors hover:text-foreground/80"
              >
                Featured
              </Link>
              <Link
                href="/store/category/2"
                className="transition-colors hover:text-foreground/80"
              >
                Ranks
              </Link>
              <Link
                href="/store/category/3"
                className="transition-colors hover:text-foreground/80"
              >
                Cosmetics
              </Link>
              <Link
                href="/store/category/4"
                className="transition-colors hover:text-foreground/80"
              >
                Gameplay
              </Link>
            </nav>
          </div>

          <div className="flex items-center md:hidden">
            <Link href="/store" className="font-bold">
              MCNation Store
            </Link>
          </div>

          <div className="flex-1 flex items-center justify-end space-x-4">
            <div className="hidden lg:flex max-w-sm items-center space-x-2">
              <Input
                type="search"
                placeholder="Search items..."
                className="w-full"
              />
              <Button type="submit" size="sm" variant="ghost">
                <Search className="h-4 w-4" />
                <span className="sr-only">Search</span>
              </Button>
            </div>
            <nav className="flex items-center space-x-2">
              <Link href="/store/cart">
                <Button variant="ghost" size="icon">
                  <ShoppingCart className="h-5 w-5" />
                  {cartCount > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-1 -mt-6 h-5 w-5 text-xs"
                    >
                      {cartCount}
                    </Badge>
                  )}
                  <span className="sr-only">Cart</span>
                </Button>
              </Link>
              
              {username ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={avatarData?.avatarUrl} alt={username} />
                        <AvatarFallback>{username[0]}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{username}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => router.push(`/profile/${username}`)}
                    >
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => router.push('/store/orders')}
                    >
                      My Orders
                    </DropdownMenuItem>
                    {hasAdminPermission && (
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => router.push('/admin/store/items')}
                      >
                        Store Admin
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={handleLogout}
                    >
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => router.push("/login")}
                  className="h-8"
                >
                  Login
                </Button>
              )}
            </nav>
          </div>
        </div>
      </header>

      <StoreProvider>
        <main className="flex-1">
          <div className="container max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </StoreProvider>

      <footer className="border-t py-6 md:py-0">
        <div className="container max-w-full flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} MCNation. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm font-medium transition-colors hover:text-foreground/80"
            >
              Main Site
            </Link>
            <Link
              href="/terms"
              className="text-sm font-medium transition-colors hover:text-foreground/80"
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              className="text-sm font-medium transition-colors hover:text-foreground/80"
            >
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
} 