"use client"

import { MessageCircleMore } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
  } from "@/components/ui/tooltip"

export function DiscordButton() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => window.open('https://discord.mcnation.lt', '_blank')}
          >
            <MessageCircleMore className="h-[1.2rem] w-[1.2rem]" />
            <span className="sr-only">Join Discord</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Join our Discord server</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
} 