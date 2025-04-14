"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-store";
import { Eye, FileDown } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

// Define types
interface Purchase {
	id: number;
	username: string;
	total_amount: number;
	discount_code: string | null;
	discount_percentage: number | null;
	payment_method: string;
	status: "pending" | "completed" | "cancelled";
	created_at: string;
	updated_at: string;
}

interface PurchaseItem {
	id: number;
	purchase_id: number;
	item_id: number;
	item_name: string;
	price: number;
	quantity: number;
}

export default function PurchasesList() {
	const { token } = useAuth();
	const [purchases, setPurchases] = useState<Purchase[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(
		null,
	);
	const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([]);
	const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
	const [filterUsername, setFilterUsername] = useState("");

	// Fetch purchases
	useEffect(() => {
		const fetchPurchases = async () => {
			try {
				const res = await fetch("/api/webstore/purchases", {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});

				if (!res.ok) {
					throw new Error("Failed to fetch purchases");
				}

				const data = await res.json();
				// The API returns an object with a data property containing the purchases array
				setPurchases(data.data || []);
			} catch (error) {
				console.error("Error fetching purchases:", error);
				toast({
					title: "Error",
					description: "Failed to load purchases. Please try again.",
					variant: "destructive",
				});
			} finally {
				setLoading(false);
			}
		};

		fetchPurchases();
	}, [token]);

	// Format date for display
	const formatDate = (dateString: string) => {
		return format(new Date(dateString), "PPP p");
	};

	// Format currency
	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
		}).format(amount);
	};

	// View purchase details
	const viewPurchaseDetails = async (purchase: Purchase) => {
		setSelectedPurchase(purchase);

		try {
			const res = await fetch(`/api/webstore/purchases/${purchase.id}/items`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (!res.ok) {
				throw new Error("Failed to fetch purchase items");
			}

			const data = await res.json();
			setPurchaseItems(data);
			setDetailsDialogOpen(true);
		} catch (error) {
			console.error("Error fetching purchase items:", error);
			toast({
				title: "Error",
				description: "Failed to load purchase details. Please try again.",
				variant: "destructive",
			});
		}
	};

	// Export purchase history as CSV
	const exportPurchases = () => {
		try {
			// Make sure purchases is an array before attempting to map
			if (!Array.isArray(purchases) || purchases.length === 0) {
				toast({
					title: "Error",
					description: "No purchase data available to export.",
					variant: "destructive",
				});
				return;
			}

			// Convert purchases to CSV format
			const headers =
				"ID,Username,Amount,Discount Code,Discount %,Payment Method,Status,Date\n";
			const rows = purchases
				.map(
					(p) =>
						`${p.id},"${p.username}",${p.total_amount},${p.discount_code || ""},${p.discount_percentage || ""},"${p.payment_method}","${p.status}","${format(new Date(p.created_at), "yyyy-MM-dd HH:mm:ss")}"`,
				)
				.join("\n");

			const csvContent = `data:text/csv;charset=utf-8,${headers}${rows}`;
			const encodedUri = encodeURI(csvContent);

			// Create download link and trigger click
			const link = document.createElement("a");
			link.setAttribute("href", encodedUri);
			link.setAttribute(
				"download",
				`purchase-history-${format(new Date(), "yyyy-MM-dd")}.csv`,
			);
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);

			toast({
				title: "Success",
				description: "Purchase history has been exported successfully.",
			});
		} catch (error) {
			console.error("Error exporting purchases:", error);
			toast({
				title: "Error",
				description: "Failed to export purchase history. Please try again.",
				variant: "destructive",
			});
		}
	};

	// Get status badge
	const getStatusBadge = (status: string) => {
		switch (status) {
			case "completed":
				return (
					<Badge
						variant="outline"
						className="bg-green-50 text-green-700 border-green-200"
					>
						Completed
					</Badge>
				);
			case "pending":
				return (
					<Badge
						variant="outline"
						className="bg-yellow-50 text-yellow-700 border-yellow-200"
					>
						Pending
					</Badge>
				);
			case "cancelled":
				return (
					<Badge
						variant="outline"
						className="bg-red-50 text-red-700 border-red-200"
					>
						Cancelled
					</Badge>
				);
			default:
				return <Badge variant="outline">{status}</Badge>;
		}
	};

	if (loading) {
		return (
			<div className="flex justify-center items-center h-48">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
			</div>
		);
	}

	// Filter purchases by username
	const filteredPurchases = Array.isArray(purchases)
		? filterUsername
			? purchases.filter((p) =>
					p.username.toLowerCase().includes(filterUsername.toLowerCase()),
				)
			: purchases
		: [];

	return (
		<div className="space-y-4">
			<div className="flex justify-between items-center">
				<div className="flex items-center space-x-2">
					<Label htmlFor="filterUsername" className="sr-only">
						Filter by username
					</Label>
					<Input
						id="filterUsername"
						placeholder="Filter by username..."
						value={filterUsername}
						onChange={(e) => setFilterUsername(e.target.value)}
						className="w-64"
					/>
				</div>

				<Button variant="outline" onClick={exportPurchases}>
					<FileDown className="h-4 w-4 mr-2" />
					Export CSV
				</Button>
			</div>

			<Card>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>ID</TableHead>
							<TableHead>Username</TableHead>
							<TableHead>Amount</TableHead>
							<TableHead>Payment Method</TableHead>
							<TableHead>Date</TableHead>
							<TableHead>Status</TableHead>
							<TableHead className="text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{filteredPurchases.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={7}
									className="text-center py-6 text-muted-foreground"
								>
									No purchases found. Purchases will appear here once customers
									make them.
								</TableCell>
							</TableRow>
						) : (
							filteredPurchases.map((purchase) => (
								<TableRow key={purchase.id}>
									<TableCell>{purchase.id}</TableCell>
									<TableCell>{purchase.username}</TableCell>
									<TableCell>{formatCurrency(purchase.total_amount)}</TableCell>
									<TableCell>{purchase.payment_method}</TableCell>
									<TableCell>{formatDate(purchase.created_at)}</TableCell>
									<TableCell>{getStatusBadge(purchase.status)}</TableCell>
									<TableCell className="text-right">
										<Button
											variant="ghost"
											size="sm"
											onClick={() => viewPurchaseDetails(purchase)}
										>
											<Eye className="h-4 w-4 mr-1" />
											Details
										</Button>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</Card>

			{/* Purchase Details Dialog */}
			{selectedPurchase && (
				<Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
					<DialogContent className="max-w-md">
						<DialogHeader>
							<DialogTitle>Purchase Details</DialogTitle>
							<DialogDescription>
								Purchase #{selectedPurchase.id} by {selectedPurchase.username}
							</DialogDescription>
						</DialogHeader>

						<div className="space-y-4">
							<div className="grid grid-cols-2 gap-4">
								<div>
									<h4 className="text-sm font-medium text-muted-foreground">
										Status
									</h4>
									<p>{getStatusBadge(selectedPurchase.status)}</p>
								</div>
								<div>
									<h4 className="text-sm font-medium text-muted-foreground">
										Date
									</h4>
									<p>{formatDate(selectedPurchase.created_at)}</p>
								</div>
								<div>
									<h4 className="text-sm font-medium text-muted-foreground">
										Payment Method
									</h4>
									<p>{selectedPurchase.payment_method}</p>
								</div>
								<div>
									<h4 className="text-sm font-medium text-muted-foreground">
										Total
									</h4>
									<p className="font-semibold">
										{formatCurrency(selectedPurchase.total_amount)}
									</p>
								</div>
							</div>

							{selectedPurchase.discount_code && (
								<div>
									<h4 className="text-sm font-medium text-muted-foreground">
										Discount Applied
									</h4>
									<p className="uppercase">
										{selectedPurchase.discount_code} (
										{selectedPurchase.discount_percentage}% off)
									</p>
								</div>
							)}

							<div>
								<h4 className="text-sm font-medium mb-2">Items Purchased</h4>
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Item</TableHead>
											<TableHead>Price</TableHead>
											<TableHead>Qty</TableHead>
											<TableHead className="text-right">Total</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{purchaseItems.map((item) => (
											<TableRow key={item.id}>
												<TableCell>{item.item_name}</TableCell>
												<TableCell>{formatCurrency(item.price)}</TableCell>
												<TableCell>{item.quantity}</TableCell>
												<TableCell className="text-right">
													{formatCurrency(item.price * item.quantity)}
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</div>
						</div>

						<DialogFooter>
							<Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			)}
		</div>
	);
}
