import { Metadata } from "next"
import { StoreProvider } from "../store-context"
import { StoreItemCard } from "../components/store-item-card"

export const metadata: Metadata = {
  title: "All Items - MCNation Store",
  description: "Browse all available items in the MCNation store",
}

async function getStoreItems() {
  try {
    const res = await fetch('/api/webstore/items', {
      next: { revalidate: 60 }, // Revalidate every minute
    })
    
    if (!res.ok) {
      throw new Error('Failed to fetch items')
    }
    
    const items = await res.json()
    return items
  } catch (error) {
    console.error('Error fetching store items:', error)
    return []
  }
}

export default async function StoreItemsPage() {
  const items = await getStoreItems()
  const activeItems = items.filter((item: any) => item.active)
  
  return (
    <StoreProvider>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">All Items</h1>
          <p className="mt-2 text-muted-foreground">
            Browse all available items in our store
          </p>
        </div>
        
        {activeItems.length === 0 ? (
          <div className="mt-8 flex justify-center">
            <p className="text-lg text-muted-foreground">No items available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {activeItems.map((item: any) => (
              <StoreItemCard key={item.id} item={item} showCategory />
            ))}
          </div>
        )}
      </div>
    </StoreProvider>
  )
} 