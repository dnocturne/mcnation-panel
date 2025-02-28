import { Metadata } from "next"
import { CategoriesList } from "./categories-list"

export const metadata: Metadata = {
  title: "Admin - Store Categories",
  description: "Manage your webstore categories",
}

export default function CategoriesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Store Categories</h2>
        <p className="text-muted-foreground">
          Manage the categories for your webstore items.
        </p>
      </div>
      
      <CategoriesList />
    </div>
  )
} 