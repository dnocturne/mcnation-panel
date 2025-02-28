import { Metadata } from "next"
import DiscountsList from "./discounts-list"

export const metadata: Metadata = {
  title: "Admin - Store Discounts",
  description: "Manage your webstore discounts",
}

export default function DiscountsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Store Discounts</h2>
        <p className="text-muted-foreground">
          Create and manage discount codes for your webstore.
        </p>
      </div>
      
      <DiscountsList />
    </div>
  )
} 