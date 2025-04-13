"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-store";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

// Define types
interface Category {
	id: number;
	name: string;
	description: string | null;
	order_index: number;
	active: boolean;
}

interface PaymentMethod {
	id: number;
	name: string;
	description: string | null;
	active: boolean;
}

interface StoreItem {
	id: number;
	name: string;
	description: string;
	price: number;
	sale_price: number | null;
	category_id: number | null;
	image_url: string | null;
	active: boolean;
	on_sale: boolean;
	paymentMethods?: PaymentMethod[];
}

// Form schema
const formSchema = z.object({
	name: z.string().min(1, { message: "Name is required" }),
	description: z.string().optional(),
	price: z.preprocess(
		(val) => (val === "" ? 0 : Number(val)),
		z.number().min(0, { message: "Price must be 0 or greater" }),
	),
	sale_price: z.preprocess(
		(val) => (val === "" ? null : Number(val)),
		z
			.number()
			.min(0, { message: "Sale price must be 0 or greater" })
			.nullable(),
	),
	category_id: z.preprocess(
		(val) => (val === "" ? null : Number(val)),
		z.number().nullable(),
	),
	image_url: z.string().optional().nullable(),
	active: z.boolean().default(false),
	on_sale: z.boolean().default(false),
	paymentMethodIds: z.array(z.number()).default([]),
});

type FormValues = z.infer<typeof formSchema>;

interface ItemFormProps {
	itemId?: number;
}

export function ItemForm({ itemId }: ItemFormProps) {
	const router = useRouter();
	const { token } = useAuth();
	const [isLoading, setIsLoading] = useState(false);
	const [categories, setCategories] = useState<Category[]>([]);
	const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
	const [initialLoading, setInitialLoading] = useState(!!itemId);

	// Form setup
	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "",
			description: "",
			price: 0,
			sale_price: null,
			category_id: null,
			image_url: null,
			active: false,
			on_sale: false,
			paymentMethodIds: [],
		},
	});

	// Fetch categories and payment methods on load
	useEffect(() => {
		const fetchData = async () => {
			try {
				// Fetch categories
				const categoriesRes = await fetch("/api/webstore/categories");
				const categoriesData = await categoriesRes.json();
				setCategories(categoriesData.filter((c: Category) => c.active));

				// Fetch payment methods
				const methodsRes = await fetch("/api/webstore/payment-methods");
				const methodsData = await methodsRes.json();
				setPaymentMethods(methodsData.filter((m: PaymentMethod) => m.active));

				// If editing, load existing item data
				if (itemId) {
					const itemRes = await fetch(`/api/webstore/items/${itemId}`, {
						headers: {
							Authorization: `Bearer ${token}`,
						},
					});

					if (!itemRes.ok) {
						throw new Error("Failed to fetch item");
					}

					const itemData: StoreItem = await itemRes.json();

					// Set form values
					form.reset({
						name: itemData.name,
						description: itemData.description || "",
						price: itemData.price,
						sale_price: itemData.sale_price,
						category_id: itemData.category_id,
						image_url: itemData.image_url,
						active: itemData.active,
						on_sale: itemData.on_sale,
						paymentMethodIds: itemData.paymentMethods?.map((pm) => pm.id) || [],
					});
				}
			} catch (error) {
				console.error("Error fetching data:", error);
				toast({
					title: "Error",
					description: "Failed to load required data. Please try again.",
					variant: "destructive",
				});
			} finally {
				setInitialLoading(false);
			}
		};

		fetchData();
	}, [itemId, token, form]);

	const onSubmit = async (values: FormValues) => {
		setIsLoading(true);

		try {
			const url = itemId
				? `/api/webstore/items/${itemId}`
				: "/api/webstore/items";

			const method = itemId ? "PUT" : "POST";

			const response = await fetch(url, {
				method,
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(values),
			});

			if (!response.ok) {
				throw new Error("Failed to save item");
			}

			toast({
				title: "Success",
				description: `Item ${itemId ? "updated" : "created"} successfully.`,
			});

			// Redirect to items list
			router.push("/admin/store/items");
		} catch (error) {
			console.error("Error saving item:", error);
			toast({
				title: "Error",
				description: "Failed to save item. Please try again.",
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
		}
	};

	// Handle payment method selection
	const togglePaymentMethod = (id: number) => {
		const currentValues = form.getValues().paymentMethodIds || [];
		const updatedValues = currentValues.includes(id)
			? currentValues.filter((pmId) => pmId !== id)
			: [...currentValues, id];

		form.setValue("paymentMethodIds", updatedValues, {
			shouldValidate: true,
			shouldDirty: true,
		});
	};

	if (initialLoading) {
		return (
			<div className="flex justify-center items-center h-48">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
			</div>
		);
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div className="space-y-6">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Name</FormLabel>
									<FormControl>
										<Input placeholder="Item name" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Description</FormLabel>
									<FormControl>
										<Textarea placeholder="Item description" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="category_id"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Category</FormLabel>
									<Select
										onValueChange={(value) =>
											field.onChange(
												value === "none" ? null : Number.parseInt(value),
											)
										}
										value={field.value?.toString() || "none"}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Select a category" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											<SelectItem value="none">None</SelectItem>
											{categories.map((category) => (
												<SelectItem
													key={category.id}
													value={category.id.toString()}
												>
													{category.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="grid grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="price"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Price</FormLabel>
										<FormControl>
											<Input
												type="number"
												min="0"
												step="0.01"
												placeholder="0.00"
												{...field}
												onChange={(e) =>
													field.onChange(
														e.target.value === ""
															? ""
															: Number.parseFloat(e.target.value),
													)
												}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="sale_price"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Sale Price (Optional)</FormLabel>
										<FormControl>
											<Input
												type="number"
												min="0"
												step="0.01"
												placeholder="0.00"
												{...field}
												value={field.value === null ? "" : field.value}
												onChange={(e) =>
													field.onChange(
														e.target.value === ""
															? null
															: Number.parseFloat(e.target.value),
													)
												}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<FormField
							control={form.control}
							name="image_url"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Image URL (Optional)</FormLabel>
									<FormControl>
										<Input
											placeholder="https://example.com/image.jpg"
											{...field}
											value={field.value || ""}
										/>
									</FormControl>
									<FormDescription>
										Enter a URL for the item image
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="active"
							render={({ field }) => (
								<FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
									<FormControl>
										<Checkbox
											checked={field.value}
											onCheckedChange={field.onChange}
										/>
									</FormControl>
									<div className="space-y-1 leading-none">
										<FormLabel>Active</FormLabel>
										<FormDescription>
											This item will be visible in the store
										</FormDescription>
									</div>
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="on_sale"
							render={({ field }) => (
								<FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
									<FormControl>
										<Checkbox
											checked={field.value}
											onCheckedChange={field.onChange}
										/>
									</FormControl>
									<div className="space-y-1 leading-none">
										<FormLabel>On Sale</FormLabel>
										<FormDescription>
											This item is currently on sale
										</FormDescription>
									</div>
								</FormItem>
							)}
						/>
					</div>

					<div>
						<Card>
							<CardContent className="pt-6">
								<h3 className="text-lg font-medium mb-4">Payment Methods</h3>
								<p className="text-sm text-muted-foreground mb-4">
									Select which payment methods are available for this item
								</p>

								<Table>
									<TableHeader>
										<TableRow>
											<TableHead className="w-[50px]" />
											<TableHead>Name</TableHead>
											<TableHead>Description</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{paymentMethods.map((method) => {
											const isSelected =
												form
													.getValues()
													.paymentMethodIds?.includes(method.id) || false;

											return (
												<TableRow
													key={method.id}
													className="cursor-pointer hover:bg-muted/50"
													onClick={() => togglePaymentMethod(method.id)}
												>
													<TableCell>
														<Checkbox
															checked={isSelected}
															onCheckedChange={() =>
																togglePaymentMethod(method.id)
															}
															onClick={(e) => e.stopPropagation()}
														/>
													</TableCell>
													<TableCell className="font-medium">
														{method.name}
													</TableCell>
													<TableCell>{method.description || "-"}</TableCell>
												</TableRow>
											);
										})}
										{paymentMethods.length === 0 && (
											<TableRow>
												<TableCell colSpan={3} className="h-24 text-center">
													No payment methods available
												</TableCell>
											</TableRow>
										)}
									</TableBody>
								</Table>
							</CardContent>
						</Card>
					</div>
				</div>

				<div className="flex justify-end space-x-4">
					<Button
						type="button"
						variant="outline"
						onClick={() => router.push("/admin/store/items")}
						disabled={isLoading}
					>
						Cancel
					</Button>
					<Button type="submit" disabled={isLoading}>
						{isLoading ? "Saving..." : itemId ? "Update Item" : "Create Item"}
					</Button>
				</div>
			</form>
		</Form>
	);
}
