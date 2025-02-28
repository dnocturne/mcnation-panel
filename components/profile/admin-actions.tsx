"use client"

import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { usePermission } from "@/hooks/use-permissions"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { useSession } from "next-auth/react"

interface AdminActionsProps {
  username: string
}

interface ActionDialogProps {
  username: string
  actionType: 'ban' | 'kick' | 'mute' | 'warn'
  isOpen: boolean
  onClose: () => void
}

function ActionDialog({ username, actionType, isOpen, onClose }: ActionDialogProps) {
  const [reason, setReason] = useState("")
  const [duration, setDuration] = useState("")
  const { toast } = useToast()
  const { data: session } = useSession()

  const handleAction = async () => {
    if (!reason) {
      toast({
        title: "Error",
        description: "Please provide a reason",
        variant: "destructive"
      })
      return
    }

    if ((actionType === 'ban' || actionType === 'mute') && !duration) {
      toast({
        title: "Error",
        description: "Please provide a duration",
        variant: "destructive"
      })
      return
    }

    try {
      let command = ""
      switch (actionType) {
        case 'ban':
          command = `ban ${username} ${duration} ${reason}`
          break
        case 'kick':
          command = `kick ${username} ${reason}`
          break
        case 'mute':
          command = `mute ${username} ${duration} ${reason}`
          break
        case 'warn':
          command = `warn ${username} ${reason}`
          break
      }

      const response = await fetch('/api/admin/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ command })
      })

      if (!response.ok) throw new Error('Failed to execute command')

      toast({
        title: "Success",
        description: `Successfully ${actionType}ed ${username}`,
      })
      onClose()
      setReason("")
      setDuration("")
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${actionType} user`,
        variant: "destructive"
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{actionType.charAt(0).toUpperCase() + actionType.slice(1)} User</DialogTitle>
          <DialogDescription>
            {actionType === 'ban' || actionType === 'mute' 
              ? `Enter the duration and reason to ${actionType} ${username}`
              : `Enter the reason to ${actionType} ${username}`
            }
          </DialogDescription>
        </DialogHeader>
        {(actionType === 'ban' || actionType === 'mute') && (
          <Input
            placeholder="Duration (e.g., 1d, 30m, 12h)"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          />
        )}
        <Input
          placeholder="Reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleAction} variant="destructive">
            Confirm {actionType.charAt(0).toUpperCase() + actionType.slice(1)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function AdminActions({ username }: AdminActionsProps) {
  const { data: hasDashboardAccess, isLoading } = usePermission('panel.dashboard')
  const [activeAction, setActiveAction] = useState<'ban' | 'kick' | 'mute' | 'warn' | null>(null)

  if (isLoading || !hasDashboardAccess) return null

  return (
    <div className="flex gap-2">
      <Button 
        variant="destructive" 
        size="sm"
        onClick={() => setActiveAction('ban')}
      >
        Ban
      </Button>
      <Button 
        variant="destructive" 
        size="sm"
        onClick={() => setActiveAction('kick')}
      >
        Kick
      </Button>
      <Button 
        variant="destructive" 
        size="sm"
        onClick={() => setActiveAction('mute')}
      >
        Mute
      </Button>
      <Button 
        variant="destructive" 
        size="sm"
        onClick={() => setActiveAction('warn')}
      >
        Warn
      </Button>

      {activeAction && (
        <ActionDialog
          username={username}
          actionType={activeAction}
          isOpen={!!activeAction}
          onClose={() => setActiveAction(null)}
        />
      )}
    </div>
  )
} 