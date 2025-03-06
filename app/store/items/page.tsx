import type { Metadata } from "next";
import { StoreItemsClient } from "./page-client";

export const metadata: Metadata = {
	title: "MCNation Store - Browse Items",
	description: "Browse and purchase items for your Minecraft experience",
};

export default function StoreItemsPage() {
	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">Store Items</h1>
				<p className="text-muted-foreground">
					Browse our selection of items for your Minecraft experience
				</p>
			</div>

			<StoreItemsClient />
		</div>
	);
}
