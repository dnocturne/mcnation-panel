import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategories, getItems } from "@/lib/database/webstore";
import { CategoryPageClient } from "./page-client";
import type { StoreItem, StoreCategory } from "@/lib/types/store";

type Props = {
	params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	// Await the params
	const resolvedParams = await params;

	// Convert slug to a more readable format (e.g., "special-offers" to "Special Offers")
	const title = resolvedParams.slug
		.split("-")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");

	return {
		title: `${title} - MCNation Store`,
		description: `Browse our ${title.toLowerCase()} in the MCNation Store`,
	};
}

export default async function CategoryPage({ params }: Props) {
	// Await and get slug parameter
	const resolvedParams = await params;
	const slug = resolvedParams.slug;

	// Get all categories
	const categories = await getCategories();

	// Find the category that matches the slug
	const category = categories.find(
		(cat) => cat.name.toLowerCase().replace(/\s+/g, "-") === slug,
	);

	// If category not found, show 404
	if (!category) {
		notFound();
	}

	// Get items for this category
	const items = await getItems(true, category.id);

	return (
		<CategoryPageClient
			category={category as StoreCategory}
			items={items as unknown as StoreItem[]}
		/>
	);
}
