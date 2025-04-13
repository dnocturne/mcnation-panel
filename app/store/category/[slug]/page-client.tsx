"use client";

import { useState } from "react";
import {
	StoreItem,
	StoreCategory,
	StorePaymentMethod,
} from "@/lib/types/store";
import { StoreItemCard } from "../../components/store-item-card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

interface CategoryPageClientProps {
	category: StoreCategory;
	items: StoreItem[];
	paymentMethods: StorePaymentMethod[];
}

export function CategoryPageClient({
	category,
	items,
	paymentMethods,
}: CategoryPageClientProps) {
	const [sortOrder, setSortOrder] = useState<string>("name-asc");

	// Sort items based on selected order
	const sortedItems = [...items].sort((a, b) => {
		if (sortOrder === "price-asc") return a.price - b.price;
		if (sortOrder === "price-desc") return b.price - a.price;
		if (sortOrder === "name-asc") return a.name.localeCompare(b.name);
		if (sortOrder === "name-desc") return b.name.localeCompare(a.name);
		return 0;
	});

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div className="space-y-1">
					<div className="flex items-center gap-2">
						<Link
							href="/store"
							className="text-sm text-muted-foreground hover:text-foreground flex items-center"
						>
							<ArrowLeft className="mr-1 h-4 w-4" />
							Back to store
						</Link>
					</div>
					<h1 className="text-3xl font-bold tracking-tight">{category.name}</h1>
					<p className="text-muted-foreground">
						{category.description ||
							`Browse all items in the ${category.name} category`}
					</p>
				</div>

				<div className="flex items-center gap-2">
					<span className="text-sm text-muted-foreground">Sort by:</span>
					<Select value={sortOrder} onValueChange={setSortOrder}>
						<SelectTrigger className="w-[160px]">
							<SelectValue placeholder="Sort by" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="name-asc">Name (A-Z)</SelectItem>
							<SelectItem value="name-desc">Name (Z-A)</SelectItem>
							<SelectItem value="price-asc">Price (Low to High)</SelectItem>
							<SelectItem value="price-desc">Price (High to Low)</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			{sortedItems.length > 0 ? (
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
					{sortedItems.map((item) => (
						<StoreItemCard key={item.id} item={item} showCategory={false} />
					))}
				</div>
			) : (
				<div className="py-12 text-center">
					<p className="text-muted-foreground mb-4">
						No items found in this category.
					</p>
					<Link href="/store" className="text-primary hover:underline">
						Browse all items
					</Link>
				</div>
			)}
		</div>
	);
}
