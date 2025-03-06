"use client"

import { useState } from "react"
import { useStoreDiscounts } from "@/lib/hooks/use-store-discounts"
import { DataTable } from "@/app/components/ui/data-table"
import { createSortableHeader, createDateCell, createActionsColumn, createStatusCell } from "@/app/components/ui/data-table/columns"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { LoadingGrid } from "@/app/components/ui/loading-grid"
import { ErrorMessage } from "@/app/components/ui/error-message"
import { formatDate } from "@/lib/utils"
import type { StoreDiscount } from "@/lib/types/store"
import Link from "next/link"
import type { ColumnDef } from "@tanstack/react-table"
import { useSession } from "next-auth/react"

export default function DiscountsList() {
  const { data: session } = useSession()
  const { discounts, isLoading, isError, refresh, isAdmin } = useStoreDiscounts({
    requireAuth: true,
    revalidateOnFocus: true,
  })

  // We'll use these state handlers for the actual implementation
  const handleViewDiscount = (discount: StoreDiscount) => {
    console.log("View discount", discount.id)
  }

  const handleEditDiscount = (discount: StoreDiscount) => {
    console.log("Edit discount", discount.id)
  }

  const handleDeleteDiscount = (discount: StoreDiscount) => {
    if (confirm(`Are you sure you want to delete the discount code "${discount.code}"?`)) {
      console.log("Delete discount", discount.id)
      // Here we would call an API to delete the discount
      // Then refresh the data
      // refresh()
    }
  }

  // Define columns for the data table
  const columns: ColumnDef<StoreDiscount>[] = [
    {
      accessorKey: "code",
      header: createSortableHeader("Code", "code" as keyof StoreDiscount),
    },
    {
      accessorKey: "percentage",
      header: createSortableHeader("Discount %", "percentage" as keyof StoreDiscount),
      cell: ({ row }: { row: { getValue: (key: keyof StoreDiscount) => number } }) => {
        const percentage = row.getValue("percentage") as number
        return `${percentage}%`
      }
    },
    {
      accessorKey: "valid_from",
      header: createSortableHeader("Valid From", "valid_from" as keyof StoreDiscount),
      cell: ({ row }: { row: { getValue: (key: keyof StoreDiscount) => string } }) => {
        const date = row.getValue("valid_from") as string
        return formatDate(date)
      }
    },
    {
      accessorKey: "valid_until",
      header: createSortableHeader("Valid Until", "valid_until" as keyof StoreDiscount),
      cell: ({ row }: { row: { getValue: (key: keyof StoreDiscount) => string } }) => {
        const date = row.getValue("valid_until") as string
        return formatDate(date)
      }
    },
    {
      accessorKey: "max_uses",
      header: createSortableHeader("Max Uses", "max_uses" as keyof StoreDiscount),
    },
    {
      accessorKey: "times_used",
      header: createSortableHeader("Times Used", "times_used" as keyof StoreDiscount),
    },
    {
      accessorKey: "active",
      header: "Status",
      cell: createStatusCell({
        key: "active" as keyof StoreDiscount,
        statusMap: {
          "true": { label: "Active", variant: "success" },
          "false": { label: "Inactive", variant: "destructive" },
        }
      }),
    },
    createActionsColumn<StoreDiscount>({
      onView: handleViewDiscount,
      onEdit: handleEditDiscount,
      onDelete: handleDeleteDiscount,
    }),
  ]

  if (isLoading) {
    return <LoadingGrid count={5} columns={{ sm: 1, md: 2, lg: 3 }} />
  }

  if (isError) {
    return (
      <ErrorMessage
        title="Failed to load discounts"
        message="There was an error loading the discount codes. This could be due to a network issue or you may not have permission to view this data."
        retryAction={refresh}
        actionText="Try Again"
      >
        <p className="mt-2">
          If this error persists, please contact support or try{" "}
          <Link href="/auth/login?redirect=/admin/store/discounts" className="underline">logging in again</Link>.
        </p>
      </ErrorMessage>
    )
  }

  // If not admin, show permission error
  if (!isAdmin) {
    return (
      <ErrorMessage
        title="Permission Denied"
        message="You don't have permission to access this area. Please log in with an admin account."
      >
        <p className="mt-2">
          Please{" "}
          <Link href="/auth/login?redirect=/admin/store/discounts" className="underline">log in with an admin account</Link>.
        </p>
      </ErrorMessage>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">All Discount Codes</h3>
          <p className="text-sm text-muted-foreground">
            Manage discount codes for your store
          </p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Discount
        </Button>
      </div>

      {discounts && discounts.length > 0 ? (
        <DataTable
          columns={columns}
          data={discounts}
          filterColumn="code"
          filterPlaceholder="Filter discount codes..."
          showColumnToggle={true}
        />
      ) : (
        <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg">
          <p className="mb-4 text-muted-foreground">No discount codes found</p>
          <Button size="sm">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Your First Discount
          </Button>
        </div>
      )}
    </div>
  )
}
