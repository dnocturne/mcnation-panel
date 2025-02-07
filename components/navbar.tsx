"use client"

import * as React from "react"
import Link from "next/link"

import { cn } from "@/lib/utils"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { ModeToggle } from "./theme-switcher"

export default function Navbar() {
  return (
    <header className="fixed top-0 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
      <div className="container flex h-14 items-center">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Lorem Ipsum</NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="grid gap-3 p-6 w-[400px]">
                  <NavigationMenuLink className="block p-2 hover:bg-accent">
                    Dolor Sit Amet
                  </NavigationMenuLink>
                  <NavigationMenuLink className="block p-2 hover:bg-accent">
                    Consectetur Adipiscing
                  </NavigationMenuLink>
                  <p className="text-sm text-muted-foreground">
                    Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  </p>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Vestibulum</NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="grid gap-3 p-6 w-[400px] md:w-[500px]">
                  <div className="grid grid-cols-2 gap-4">
                    <NavigationMenuLink className="block p-2 hover:bg-accent">
                      Mauris Rhoncus
                    </NavigationMenuLink>
                    <NavigationMenuLink className="block p-2 hover:bg-accent">
                      Phasellus Volutpat
                    </NavigationMenuLink>
                    <NavigationMenuLink className="block p-2 hover:bg-accent">
                      Nullam Dignissim
                    </NavigationMenuLink>
                    <NavigationMenuLink className="block p-2 hover:bg-accent">
                      Fusce Vehicula
                    </NavigationMenuLink>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
                  </p>
                </div>
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
          </NavigationMenuList>
        </NavigationMenu>
        <div className="ml-auto">
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}
