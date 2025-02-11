"use client"

import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Menu } from "lucide-react"

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "./theme-switcher"
import { DiscordButton } from "./discord-button"

export default function Navbar() {
  return (
    <header className="fixed top-0 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
      <div className="px-4 flex h-14 items-center justify-between max-w-[2520px] mx-auto">
        {/* Desktop Navigation */}
        <div className="hidden md:flex flex-1">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Lorem Ipsum</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4">
                    <ListItem href="#" title="Dolor Sit Amet">
                      Consectetur adipiscing elit, sed do eiusmod tempor.
                    </ListItem>
                    <ListItem href="#" title="Consectetur Adipiscing">
                      Sed do eiusmod tempor incididunt ut labore.
                    </ListItem>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <NavigationMenuTrigger>Vestibulum</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[500px] gap-3 p-4 md:grid-cols-2">
                    <ListItem href="#" title="Mauris Rhoncus">
                      Phasellus volutpat metus eget egestas.
                    </ListItem>
                    <ListItem href="#" title="Phasellus Volutpat">
                      Nullam dignissim convallis est.
                    </ListItem>
                    <ListItem href="#" title="Nullam Dignissim">
                      Fusce vehicula dolor arcu.
                    </ListItem>
                    <ListItem href="#" title="Fusce Vehicula">
                      Integer vel augue consequat.
                    </ListItem>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger>Suspendisse</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="p-4 w-[300px]">
                    <p className="text-sm text-muted-foreground mb-2">
                      Duis aute irure dolor in reprehenderit in voluptate velit esse cillum.
                    </p>
                    <NavigationMenuLink className="block p-2 hover:bg-accent">
                      Nulla Facilisi
                    </NavigationMenuLink>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Admin</NavigationMenuTrigger>
                <NavigationMenuContent>
                <div className="p-4 w-[300px]">
                <p className="text-sm text-muted-foreground mb-2">
                      Duis aute irure dolor in reprehenderit in voluptate velit esse cillum.
                    </p>
                    <NavigationMenuLink className="block p-2 hover:bg-accent">
                      Admin Dashboard
                    </NavigationMenuLink>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-2">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <SheetTitle>Navigation Menu</SheetTitle>
              <nav className="flex flex-col gap-4 mt-4">
                <div className="flex flex-col space-y-3">
                  <Link href="#" className="text-sm font-medium hover:underline">
                    Lorem Ipsum
                  </Link>
                  <Link href="#" className="text-sm font-medium hover:underline">
                    Vestibulum
                  </Link>
                  <Link href="#" className="text-sm font-medium hover:underline">
                    Suspendisse
                  </Link>
                  <Link href="#" className="text-sm font-medium hover:underline">
                    Admin
                  </Link>
                </div>
                <div className="flex gap-2 mt-4">
                  <DiscordButton />
                  <ModeToggle />
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        {/* Right-side buttons */}
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2">
            <DiscordButton />
            <ModeToggle />
          </div>
        </div>
      </div>
    </header>
  )
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a"> & {
    title: string
  }
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"
