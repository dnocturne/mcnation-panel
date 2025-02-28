import { Metadata } from "next"
import { StoreAdminClient } from "../../store-admin-client"
import { ItemForm } from "../item-form"

export const metadata: Metadata = {
  title: "Admin - Create Store Item",
  description: "Create a new item for your webstore",
}

export default function NewItemPage() {
  return (
    <StoreAdminClient>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Create New Item</h2>
          <p className="text-muted-foreground">
            Add a new item to your webstore.
          </p>
        </div>
        
        <ItemForm />
      </div>
    </StoreAdminClient>
  )
} 