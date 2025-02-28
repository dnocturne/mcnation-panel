import { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { StoreProvider } from "./store-context"
import { Button } from "@/components/ui/button"
import { StoreItemCard } from "./components/store-item-card"
import { getStoreItems } from "@/lib/services/store-service"
import { StoreItem } from "@/lib/types/store"

export const metadata: Metadata = {
  title: "MCNation Store",
  description: "Browse and purchase items for your Minecraft experience on MCNation",
}

/**
 * Fetch store items for the store page
 */
async function fetchStoreItems(): Promise<StoreItem[]> {
  try {
    // Get active items from the store service
    const items = await getStoreItems(true)
    return items
  } catch (error) {
    console.error('Error fetching store items:', error)
    return []
  }
}

export default async function StorePage() {
  const items = await fetchStoreItems()
  const featuredItems = items.slice(0, 6)
  
  return (
    <StoreProvider>
      {/* Hero Section */}
      <section className="relative h-[500px] w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary-foreground/20">
          <Image
            src="/images/store-hero.jpg"
            alt="MCNation Store"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="relative z-10 mx-auto flex h-full w-full flex-col items-center justify-center px-4 text-center text-white sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Welcome to the MCNation Store
          </h1>
          <p className="mt-6 max-w-lg text-xl">
            Enhance your Minecraft experience with exclusive ranks, cosmetics, and gameplay items.
          </p>
          <div className="mt-10 flex gap-4">
            <Button size="lg" asChild>
              <Link href="/store/items">Browse All Items</Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-white/10 text-white hover:bg-white/20" asChild>
              <Link href="/store/categories/ranks">View Ranks</Link>
            </Button>
          </div>
        </div>
      </section>
      
      {/* Featured Items */}
      <section className="mx-auto w-full px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Featured Items</h2>
          <Link href="/store/items" className="text-primary hover:underline">
            View all items
          </Link>
        </div>
        
        {featuredItems.length === 0 ? (
          <div className="mt-8 flex justify-center">
            <p className="text-lg text-muted-foreground">No featured items available</p>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
            {featuredItems.map((item) => (
              <StoreItemCard key={item.id} item={item} showCategory />
            ))}
          </div>
        )}
      </section>
      
      {/* Categories Section */}
      <section className="bg-background py-16">
        <div className="mx-auto w-full px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold tracking-tight">Shop by Category</h2>
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { name: "Ranks", image: "/images/ranks.jpg", href: "/store/categories/ranks" },
              { name: "Cosmetics", image: "/images/cosmetics.jpg", href: "/store/categories/cosmetics" },
              { name: "Gameplay", image: "/images/gameplay.jpg", href: "/store/categories/gameplay" },
              { name: "Featured", image: "/images/featured.jpg", href: "/store/categories/featured" },
            ].map((category) => (
              <Link
                key={category.name}
                href={category.href}
                className="group relative aspect-square overflow-hidden rounded-lg shadow-md transition-all hover:shadow-lg"
              >
                <div className="absolute inset-0 bg-black/40 transition-all group-hover:bg-black/30">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover transition-all group-hover:scale-105"
                    quality={90}
                    priority
                  />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <h3 className="text-3xl font-bold text-white">{category.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      
      {/* Information Section */}
      <section className="mx-auto w-full px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="rounded-lg bg-card p-6 shadow">
            <h3 className="text-xl font-bold">How It Works</h3>
            <p className="mt-4 text-muted-foreground">
              Browse our store, add items to your cart, and checkout securely. After purchase, your
              items will be automatically applied to your account.
            </p>
          </div>
          <div className="rounded-lg bg-card p-6 shadow">
            <h3 className="text-xl font-bold">Secure Payments</h3>
            <p className="mt-4 text-muted-foreground">
              We support various payment methods to ensure a smooth and secure transaction process.
              Your payment information is never stored on our servers.
            </p>
          </div>
          <div className="rounded-lg bg-card p-6 shadow">
            <h3 className="text-xl font-bold">Support</h3>
            <p className="mt-4 text-muted-foreground">
              Need help with your purchase? Our support team is ready to assist you. Contact us
              through Discord or our support portal.
            </p>
          </div>
        </div>
      </section>
    </StoreProvider>
  )
} 