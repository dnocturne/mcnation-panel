"use client"

import { useQuery } from "@tanstack/react-query"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Card } from "@/components/ui/card"
import { useState } from "react"

interface Punishment {
  id: number
  banned_by_name: string
  reason: string
  time: number
  until: number
  active: number
  removed_by_name: string | null
  removed_by_reason: string | null
  player_name: string
}

interface PunishmentsTableProps {
  type: "mutes" | "bans" | "kicks" | "warns"
}

export function PunishmentsTable({ type }: PunishmentsTableProps) {
  const [page, setPage] = useState(1)
  const pageSize = 10

  const { data, isLoading } = useQuery({
    queryKey: [type, page],
    queryFn: async () => {
      const response = await fetch(`/api/punishments/${type}?page=${page}&pageSize=${pageSize}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch ${type}`)
      }
      return response.json()
    },
  })

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  const getStatus = (punishment: Punishment) => {
    // Convert active to a number if it's not already
    const activeNum = Number(punishment.active)
    
    console.log('Punishment data:', {
      id: punishment.id,
      active: activeNum,
      activeOriginal: punishment.active,
      removed_by_name: punishment.removed_by_name,
      type: type
    });

    if (punishment.removed_by_name !== null && punishment.removed_by_name !== '') {
      return {
        text: 'Removed',
        class: 'bg-yellow-100 text-yellow-800'
      }
    }
    
    if (activeNum === 1) {
      return {
        text: 'Active',
        class: 'bg-red-100 text-red-800'
      }
    }
    
    return {
      text: 'Expired',
      class: 'bg-green-100 text-green-800'
    }
  }

  return (
    <Card className="p-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Player</TableHead>
            <TableHead>By</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead>Date</TableHead>
            {type !== "kicks" && <TableHead>Until</TableHead>}
            {type !== "kicks" && <TableHead>Status</TableHead>}
            {type !== "kicks" && <TableHead>Removed By</TableHead>}
            {type !== "kicks" && <TableHead>Removal Reason</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.items.map((punishment: Punishment) => (
            <TableRow key={punishment.id}>
              <TableCell>{punishment.player_name}</TableCell>
              <TableCell>{punishment.banned_by_name}</TableCell>
              <TableCell>{punishment.reason}</TableCell>
              <TableCell>{formatDate(punishment.time)}</TableCell>
              {type !== "kicks" && (
                <>
                  <TableCell>{formatDate(punishment.until)}</TableCell>
                  <TableCell>
                    {(() => {
                      const status = getStatus(punishment)
                      return (
                        <span className={`px-2 py-1 rounded-full text-xs ${status.class}`}>
                          {status.text}
                        </span>
                      )
                    })()}
                  </TableCell>
                  <TableCell>
                    {punishment.removed_by_name || '-'}
                  </TableCell>
                  <TableCell>
                    {punishment.removed_by_reason || '-'}
                  </TableCell>
                </>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {data && (
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink>{page}</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext 
                onClick={() => setPage(p => p + 1)}
                disabled={!data?.items?.length || data?.items?.length < pageSize}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </Card>
  )
} 