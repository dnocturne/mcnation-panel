import type { Metadata } from "next"
import { StoreAdminClient } from "../../store-admin-client"
import { ItemForm } from "../item-form"

export const metadata: Metadata = {
  title: "Admin - Edit Store Item",
  description: "Edit an existing item in your webstore",
}

export default function EditItemPage({ params }: { params: { id: string } }) {
  const itemId = Number.parseInt(params.id)

  return (
    <StoreAdminClient>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Edit Item</h2>
          <p className="text-muted-foreground">
            Update an existing item in your webstore.
          </p>
        </div>
        
        <ItemForm itemId={itemId} />
      </div>
    </StoreAdminClient>
  )
} 