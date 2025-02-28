import { Metadata } from "next"
import PurchasesList from "./purchases-list"

export const metadata: Metadata = {
  title: "Admin - Store Purchases",
  description: "Manage your webstore purchases",
}

export default function PurchasesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Store Purchases</h2>
        <p className="text-muted-foreground">
          View and manage customer purchases from your webstore.
        </p>
      </div>
      
      <PurchasesList />
    </div>
  )
} 