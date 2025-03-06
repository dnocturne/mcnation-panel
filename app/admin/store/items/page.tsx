import type { Metadata } from "next"
import { StoreItemsList } from "./store-items-list"

export const metadata: Metadata = {
  title: "Admin - Store Items",
  description: "Manage your webstore items",
}

export default function StoreItemsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Store Items</h2>
        <p className="text-muted-foreground">
          Manage the items available in your webstore.
        </p>
      </div>
      
      <StoreItemsList />
    </div>
  )
} 