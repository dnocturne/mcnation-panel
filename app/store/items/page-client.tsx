"use client"

import { useState, useMemo, useCallback } from "react"
import { useStoreItems } from "@/lib/hooks/use-store-items"
import { useStoreCategories } from "@/lib/hooks/use-store-categories"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StoreItemCard } from "../components/store-item-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LoadingGrid } from "@/app/components/ui/loading-grid"
import { ErrorMessage } from "@/app/components/ui/error-message"
import { Search, SlidersHorizontal, RefreshCw } from "lucide-react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export function StoreItemsClient() {
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState("name") // "name", "price-asc", "price-desc"
  const [currentCategory, setCurrentCategory] = useState<number | undefined>(undefined)
  
  const { categories, isLoading: categoriesLoading, isError: categoriesError } = useStoreCategories({
    revalidateOnFocus: true,
  })
  
  const { 
    items, 
    isLoading, 
    isError, 
    refresh
  } = useStoreItems({
    categoryId: currentCategory,
    revalidateOnFocus: true,
    refreshInterval: 60000, // 1 minute
  })
  
  // Filter items by search term - memoized to prevent unnecessary re-filtering
  const filteredItems = useMemo(() => {
    const searchTerm = search.toLowerCase();
    return items?.filter(item => 
      item.name.toLowerCase().includes(searchTerm) ||
      item.description.toLowerCase().includes(searchTerm)
    ) || [];
  }, [items, search]);
  
  // Sort items according to selected option - memoized to prevent unnecessary re-sorting
  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      switch (sortBy) {
        case "price-asc":
          return (a.sale_price ?? a.price) - (b.sale_price ?? b.price)
        case "price-desc":
          return (b.sale_price ?? b.price) - (a.sale_price ?? a.price)
        case "name":
        default:
          return a.name.localeCompare(b.name)
      }
    });
  }, [filteredItems, sortBy]);
  
  // Handle category selection
  const handleCategoryChange = useCallback((categoryId: string) => {
    if (categoryId === "all") {
      setCurrentCategory(undefined)
    } else {
      setCurrentCategory(parseInt(categoryId))
    }
  }, []);
  
  // Clear search handler
  const handleClearSearch = useCallback(() => {
    setSearch("");
  }, []);
  
  return (
    <div className="space-y-6">
      {/* Filter and Search Controls */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex-1 md:max-w-sm">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8"
            />
          </div>
        </div>
        
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            onClick={() => refresh()} 
            aria-label="Refresh items"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>
      
      {/* Category Tabs */}
      {categoriesLoading ? (
        <div className="w-full h-10 bg-muted/30 rounded animate-pulse" />
      ) : categoriesError ? (
        <div className="text-sm text-destructive p-2">Failed to load categories</div>
      ) : categories && categories.length > 0 && (
        <Tabs 
          defaultValue="all" 
          className="w-full"
          onValueChange={handleCategoryChange}
          value={currentCategory ? currentCategory.toString() : "all"}
        >
          <TabsList className="w-full overflow-auto">
            <TabsTrigger value="all">All Items</TabsTrigger>
            {categories.map(category => (
              <TabsTrigger key={category.id} value={category.id.toString()}>
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}
      
      {/* Items Grid */}
      {isLoading ? (
        <LoadingGrid count={8} columns={{ sm: 2, md: 3, lg: 4 }} />
      ) : isError ? (
        <ErrorMessage 
          message="Error loading store items. Please try again."
          retryAction={refresh}
          actionText="Try Again"
        />
      ) : sortedItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-lg text-muted-foreground">
            {search ? "No items found matching your search." : "No items available."}
          </p>
          {search && (
            <Button variant="outline" className="mt-4" onClick={handleClearSearch}>
              Clear Search
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {sortedItems.map((item) => (
            <StoreItemCard key={item.id} item={item} showCategory />
          ))}
        </div>
      )}
    </div>
  )
} 