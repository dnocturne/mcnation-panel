"use client";

import { useState } from "react";
import { useStoreItem } from "@/lib/hooks/use-store-item";
import { useStore } from "@/app/store/store-context";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { LoadingGrid } from "@/app/components/ui/loading-grid";
import { ErrorMessage } from "@/app/components/ui/error-message";
import { formatCurrency } from "@/lib/utils";
import Image from "next/image";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { toast } from "@/hooks/use-toast";

interface StoreItemClientProps {
	itemId: number;
	paymentMethods: Array<{ id: number; name: string }>;
}

export function StoreItemClient({
	itemId,
	paymentMethods,
}: StoreItemClientProps) {
	const [quantity, setQuantity] = useState(1);
	const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
		number | null
	>(paymentMethods.length > 0 ? paymentMethods[0].id : null);
	const [tab, setTab] = useState("details");

	const { item, isLoading, isError, refresh } = useStoreItem(itemId, {
		revalidateOnFocus: true,
	});

	const { addToCart } = useStore();

	const handleAddToCart = () => {
		if (!item || !selectedPaymentMethod) return;

		// Add the item to cart with selected payment method
		addToCart(item, selectedPaymentMethod);

		// Show success toast
		toast({
			title: "Item added to cart",
			description: `${item.name} (Qty: ${quantity}) has been added to your cart.`,
			duration: 3000,
		});
	};

	if (isLoading) {
		return (
			<div className="space-y-4">
				<div className="w-32">
					<Link
						href="/store/items"
						className="flex items-center text-muted-foreground hover:text-foreground"
					>
						<ArrowLeft className="mr-2 h-4 w-4" />
						Back to items
					</Link>
				</div>
				<LoadingGrid count={1} columns={{ sm: 1, md: 1, lg: 1 }} />
			</div>
		);
	}

	if (isError || !item) {
		return (
			<div className="space-y-4">
				<div className="w-32">
					<Link
						href="/store/items"
						className="flex items-center text-muted-foreground hover:text-foreground"
					>
						<ArrowLeft className="mr-2 h-4 w-4" />
						Back to items
					</Link>
				</div>
				<ErrorMessage
					message="Failed to load the item. It might not exist or there was an error fetching it."
					retryAction={refresh}
				/>
			</div>
		);
	}

	const hasDiscount =
		item.sale_price !== null && item.sale_price < item.price && item.on_sale;
	const displayPrice = hasDiscount ? item.sale_price : item.price;

	return (
		<div className="space-y-6">
			<div className="w-32">
				<Link
					href="/store/items"
					className="flex items-center text-muted-foreground hover:text-foreground"
				>
					<ArrowLeft className="mr-2 h-4 w-4" />
					Back to items
				</Link>
			</div>

			<div className="grid gap-6 md:grid-cols-2">
				{/* Image */}
				<Card className="overflow-hidden">
					<div className="aspect-square w-full relative bg-slate-100">
						{item.image_url ? (
							<Image
								src={item.image_url}
								alt={item.name}
								fill
								className="object-cover"
								sizes="(max-width: 768px) 100vw, 50vw"
								priority
							/>
						) : (
							<div className="flex h-full items-center justify-center bg-slate-200">
								<span className="text-slate-400">No image available</span>
							</div>
						)}

						{hasDiscount && (
							<Badge variant="destructive" className="absolute right-2 top-2">
								Sale
							</Badge>
						)}

						{item.category_name && (
							<Badge
								variant="outline"
								className="absolute left-2 top-2 bg-white/80"
							>
								{item.category_name}
							</Badge>
						)}
					</div>
				</Card>

				{/* Details */}
				<div className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle className="text-2xl">{item.name}</CardTitle>
							{item.category_name && (
								<Badge variant="outline" className="w-fit">
									{item.category_name}
								</Badge>
							)}
							<CardDescription>{item.description}</CardDescription>
						</CardHeader>

						<CardContent>
							<div className="space-y-4">
								<div className="flex items-center gap-2">
									{hasDiscount ? (
										<>
											<span className="text-2xl font-bold text-primary">
												{formatCurrency(displayPrice ?? 0)}
											</span>
											<span className="text-xl text-muted-foreground line-through">
												{formatCurrency(item.price)}
											</span>
										</>
									) : (
										<span className="text-2xl font-bold">
											{formatCurrency(displayPrice ?? 0)}
										</span>
									)}
								</div>

								<div className="grid gap-4 sm:grid-cols-2">
									<div className="space-y-2">
										<label
											className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
											htmlFor="payment-method"
										>
											Payment Method
										</label>
										<Select
											value={selectedPaymentMethod?.toString() || ""}
											onValueChange={(value) =>
												setSelectedPaymentMethod(Number.parseInt(value))
											}
										>
											<SelectTrigger className="w-full">
												<SelectValue placeholder="Select payment method" />
											</SelectTrigger>
											<SelectContent>
												{paymentMethods.map((method) => (
													<SelectItem
														key={method.id}
														value={method.id.toString()}
													>
														{method.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>

									<div className="space-y-2">
										<label
											className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
											htmlFor="quantity"
										>
											Quantity
										</label>
										<Select
											value={quantity.toString()}
											onValueChange={(value) =>
												setQuantity(Number.parseInt(value))
											}
										>
											<SelectTrigger className="w-full">
												<SelectValue placeholder="Select quantity" />
											</SelectTrigger>
											<SelectContent>
												{[1, 2, 3, 4, 5, 10].map((q) => (
													<SelectItem key={q} value={q.toString()}>
														{q}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
								</div>
							</div>
						</CardContent>

						<CardFooter>
							<Button
								className="w-full"
								onClick={handleAddToCart}
								disabled={!selectedPaymentMethod}
							>
								<ShoppingCart className="mr-2 h-4 w-4" />
								Add to Cart
							</Button>
						</CardFooter>
					</Card>

					<Card>
						<Tabs defaultValue="details" value={tab} onValueChange={setTab}>
							<TabsList className="w-full">
								<TabsTrigger value="details">Details</TabsTrigger>
								<TabsTrigger value="usage">Usage</TabsTrigger>
							</TabsList>
							<TabsContent value="details" className="p-4">
								<div className="space-y-4">
									<h3 className="text-lg font-semibold">Item Details</h3>
									<ul className="ml-6 list-disc">
										<li>Access to exclusive features</li>
										<li>Permanent after purchase</li>
										<li>Works on all MCNation servers</li>
										{hasDiscount && (
											<li className="text-primary">
												On sale for a limited time!
											</li>
										)}
									</ul>
								</div>
							</TabsContent>
							<TabsContent value="usage" className="p-4">
								<div className="space-y-4">
									<h3 className="text-lg font-semibold">How to Use</h3>
									<ol className="ml-6 list-decimal space-y-2">
										<li>Purchase this item</li>
										<li>Complete checkout with your minecraft username</li>
										<li>
											The item will be automatically added to your account
										</li>
										<li>
											Log in to any MCNation server to start using your new item
										</li>
									</ol>
								</div>
							</TabsContent>
						</Tabs>
					</Card>
				</div>
			</div>
		</div>
	);
}
