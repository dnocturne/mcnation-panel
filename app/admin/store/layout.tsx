import { Metadata } from "next"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StoreAdminClient } from "./store-admin-client"

export const metadata: Metadata = {
  title: "Admin - Webstore",
  description: "Admin dashboard for webstore management",
}

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <StoreAdminClient>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Webstore Management</h1>
          <div className="flex space-x-2">
            <Button asChild variant="outline">
              <Link href="/admin">Back to Admin</Link>
            </Button>
            <Button asChild>
              <Link href="/store" target="_blank">View Store</Link>
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="items" className="w-full">
          <TabsList className="grid grid-cols-5 w-full mb-6">
            <TabsTrigger value="items" asChild>
              <Link href="/admin/store/items">Items</Link>
            </TabsTrigger>
            <TabsTrigger value="categories" asChild>
              <Link href="/admin/store/categories">Categories</Link>
            </TabsTrigger>
            <TabsTrigger value="discounts" asChild>
              <Link href="/admin/store/discounts">Discounts</Link>
            </TabsTrigger>
            <TabsTrigger value="payment-methods" asChild>
              <Link href="/admin/store/payment-methods">Payment Methods</Link>
            </TabsTrigger>
            <TabsTrigger value="purchases" asChild>
              <Link href="/admin/store/purchases">Purchases</Link>
            </TabsTrigger>
          </TabsList>
          
          <Card className="p-6">
            {children}
          </Card>
        </Tabs>
      </div>
    </StoreAdminClient>
  )
} 