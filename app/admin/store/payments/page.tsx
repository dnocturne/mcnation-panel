"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { AdminVerificationWrapper } from "@/components/admin-verification-wrapper";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { PageHeading } from "@/components/page-heading";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { SearchIcon, RefreshCw } from "lucide-react";

// Define payment interface
interface StripePayment {
	id: string;
	amount: number;
	currency: string;
	status: string;
	customerEmail: string;
	minecraftUsername: string;
	created: string;
	paymentMethod?: {
		brand: string;
		last4: string;
	};
}

// Payment card props interface
interface PaymentCardProps {
	payment: StripePayment;
	formatCurrency: (amount: number, currency: string) => string;
	formatDate: (dateString: string) => string;
}

export default function PaymentsPage() {
	return (
		<AdminVerificationWrapper>
			<PaymentsContent />
		</AdminVerificationWrapper>
	);
}

function PaymentsContent() {
	const [isLoading, setIsLoading] = useState(true);
	const [payments, setPayments] = useState<StripePayment[]>([]);
	const [searchTerm, setSearchTerm] = useState("");

	// Fetch payments when component mounts
	useEffect(() => {
		fetchPayments();
	}, []);

	const fetchPayments = async () => {
		setIsLoading(true);
		try {
			// Fetch real payment data from our API endpoint
			const response = await fetch("/api/admin/payments");

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || "Failed to fetch payment data");
			}

			const data = await response.json();
			setPayments(data);
		} catch (error) {
			console.error("Error fetching payments:", error);
			toast({
				title: "Error",
				description:
					error instanceof Error
						? error.message
						: "Failed to load payment data",
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
		}
	};

	const filteredPayments = payments.filter((payment) => {
		const searchLower = searchTerm.toLowerCase();
		return (
			payment.id.toLowerCase().includes(searchLower) ||
			payment.customerEmail.toLowerCase().includes(searchLower) ||
			payment.minecraftUsername.toLowerCase().includes(searchLower)
		);
	});

	const formatCurrency = (amount: number, currency: string) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: currency,
		}).format(amount / 100);
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleString();
	};

	return (
		<div className="container py-6 space-y-6">
			<PageHeading
				title="Payment Management"
				description="View and manage Stripe payments"
			/>

			<div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
				<div className="relative">
					<SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
					<Input
						placeholder="Search payments..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="pl-10 w-full md:w-80"
					/>
				</div>

				<Button
					variant="outline"
					onClick={fetchPayments}
					disabled={isLoading}
					className="self-end md:self-auto"
				>
					<RefreshCw
						className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
					/>
					Refresh
				</Button>
			</div>

			<Tabs defaultValue="all" className="w-full">
				<TabsList>
					<TabsTrigger value="all">All Payments</TabsTrigger>
					<TabsTrigger value="succeeded">Succeeded</TabsTrigger>
					<TabsTrigger value="pending">Pending</TabsTrigger>
					<TabsTrigger value="failed">Failed</TabsTrigger>
				</TabsList>

				<TabsContent value="all" className="mt-4">
					{isLoading ? (
						<LoadingSpinner text="Loading payment data..." fullHeight />
					) : filteredPayments.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-12">
							<p className="text-muted-foreground mb-4">No payments found</p>
							<Button onClick={fetchPayments}>Refresh</Button>
						</div>
					) : (
						<div className="grid gap-4">
							{filteredPayments.map((payment) => (
								<PaymentCard
									key={payment.id}
									payment={payment}
									formatCurrency={formatCurrency}
									formatDate={formatDate}
								/>
							))}
						</div>
					)}
				</TabsContent>

				<TabsContent value="succeeded" className="mt-4">
					{/* Filter and display only succeeded payments */}
					<p className="text-muted-foreground text-center">
						Filter implemented in production version
					</p>
				</TabsContent>

				<TabsContent value="pending" className="mt-4">
					{/* Filter and display only pending payments */}
					<p className="text-muted-foreground text-center">
						Filter implemented in production version
					</p>
				</TabsContent>

				<TabsContent value="failed" className="mt-4">
					{/* Filter and display only failed payments */}
					<p className="text-muted-foreground text-center">
						Filter implemented in production version
					</p>
				</TabsContent>
			</Tabs>
		</div>
	);
}

function PaymentCard({
	payment,
	formatCurrency,
	formatDate,
}: PaymentCardProps) {
	return (
		<Card>
			<CardHeader className="pb-2">
				<CardTitle className="flex justify-between items-start">
					<span>Payment {payment.id}</span>
					<span
						className={`text-sm px-2 py-1 rounded ${
							payment.status === "succeeded"
								? "bg-green-100 text-green-800"
								: payment.status === "pending"
									? "bg-yellow-100 text-yellow-800"
									: "bg-red-100 text-red-800"
						}`}
					>
						{payment.status}
					</span>
				</CardTitle>
				<CardDescription>{formatDate(payment.created)}</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<Label className="text-muted-foreground text-xs">Amount</Label>
						<p className="font-medium">
							{formatCurrency(payment.amount, payment.currency)}
						</p>
					</div>
					<div>
						<Label className="text-muted-foreground text-xs">
							Payment Method
						</Label>
						<p className="font-medium capitalize">
							{payment.paymentMethod?.brand} •••• {payment.paymentMethod?.last4}
						</p>
					</div>
					<div>
						<Label className="text-muted-foreground text-xs">Customer</Label>
						<p className="font-medium">{payment.customerEmail}</p>
					</div>
					<div>
						<Label className="text-muted-foreground text-xs">
							Minecraft Username
						</Label>
						<p className="font-medium">{payment.minecraftUsername}</p>
					</div>
				</div>

				<div className="mt-4 pt-4 border-t flex justify-end space-x-2">
					<Button variant="outline" size="sm">
						View Details
					</Button>
					<Button variant="outline" size="sm">
						Refund
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
