"use client"

import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"

interface StoreItem {
  id: number
  name: string
  description: string
  price: number
  sale_price: number | null
  category_id: number | null
  image_url: string | null
  active: boolean
  category_name?: string
}

interface StoreItemCardProps {
  item: StoreItem
  showCategory?: boolean
}

export function StoreItemCard({ item, showCategory = false }: StoreItemCardProps) {
  const hasDiscount = item.sale_price !== null && item.sale_price < item.price
  const displayPrice = hasDiscount ? item.sale_price! : item.price
  
  return (
    <Card className="h-full flex flex-col overflow-hidden transition-all hover:shadow-md">
      <Link href={`/store/items/${item.id}`} className="block">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
          {item.image_url ? (
            <Image
              src={item.image_url}
              alt={item.name}
              fill
              className="object-cover transition-all hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-slate-200">
              <span className="text-slate-400">No image</span>
            </div>
          )}
          
          {hasDiscount && (
            <Badge variant="destructive" className="absolute right-2 top-2">
              Sale
            </Badge>
          )}
        </div>
        
        <CardHeader className="p-4">
          <div className="flex items-start justify-between">
            <CardTitle className="line-clamp-1 text-lg font-bold">{item.name}</CardTitle>
          </div>
          {showCategory && item.category_name && (
            <Badge variant="outline" className="mt-1">
              {item.category_name}
            </Badge>
          )}
          <CardDescription className="line-clamp-2 mt-2 h-10">
            {item.description}
          </CardDescription>
        </CardHeader>
      </Link>
      
      <CardContent className="flex-grow p-4 pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {hasDiscount ? (
              <>
                <span className="text-lg font-bold text-primary">
                  {formatCurrency(displayPrice)}
                </span>
                <span className="text-sm text-muted-foreground line-through">
                  {formatCurrency(item.price)}
                </span>
              </>
            ) : (
              <span className="text-lg font-bold">
                {formatCurrency(displayPrice)}
              </span>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <Link href={`/store/items/${item.id}`} className="w-full">
          <Button variant="default" className="w-full">
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
} 