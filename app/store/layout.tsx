import { Metadata } from "next"
import StoreLayoutClient from "./store-layout-client"

export const metadata: Metadata = {
  title: "MCNation Store",
  description: "Shop for in-game items, ranks, and more",
}

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <StoreLayoutClient>{children}</StoreLayoutClient>
} 