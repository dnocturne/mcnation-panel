import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StoreItemCard } from "./components/store-item-card";
import { getStoreItems } from "@/lib/services/store-service";
import type { StoreItem } from "@/lib/types/store";

export const metadata: Metadata = {
	title: "MCNation Store",
	description:
		"Browse and purchase items for your Minecraft experience on MCNation",
};

/**
 * Fetch store items for the store page
 */
async function fetchStoreItems(): Promise<StoreItem[]> {
	try {
		// Get active items from the store service
		const items = await getStoreItems(true);
		return items;
	} catch (error) {
		console.error("Error fetching store items:", error);
		return [];
	}
}

export default async function StorePage() {
	const items = await fetchStoreItems();
	const featuredItems = items.slice(0, 6);

	return (
		<>
			{/* Hero Section */}
			<section className="relative h-[500px] w-full overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary-foreground/20">
					<Image
						src="/images/store-hero.jpg"
						alt="MCNation Store"
						fill
						className="object-cover"
						priority
					/>
				</div>

				<div className="relative flex h-full flex-col items-center justify-center text-center">
					<h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
						MCNation Store
					</h1>
					<p className="mt-4 max-w-2xl text-xl text-white">
						Enhance your Minecraft experience with exclusive items and perks
					</p>
					<div className="mt-8 flex flex-wrap justify-center gap-4">
						<Button asChild size="lg">
							<Link href="/store/items">Browse All Items</Link>
						</Button>
						<Button
							variant="outline"
							asChild
							size="lg"
							className="bg-white/10 text-white hover:bg-white/20"
						>
							<Link href="#featured">Featured Items</Link>
						</Button>
					</div>
				</div>
			</section>

			{/* Featured Items Section */}
			<section id="featured" className="py-16">
				<div className="mb-10 text-center">
					<h2 className="text-3xl font-bold tracking-tight">Featured Items</h2>
					<p className="mt-2 text-muted-foreground">
						Check out our most popular items and special offers
					</p>
				</div>

				{featuredItems.length > 0 ? (
					<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
						{featuredItems.map((item) => (
							<StoreItemCard key={item.id} item={item} />
						))}
					</div>
				) : (
					<div className="text-center py-12">
						<p className="text-muted-foreground">
							No featured items available at the moment.
						</p>
					</div>
				)}

				<div className="mt-12 text-center">
					<Button asChild>
						<Link href="/store/items">View All Items</Link>
					</Button>
				</div>
			</section>

			{/* Categories Section */}
			<section className="py-16 bg-muted/50">
				<div className="mb-10 text-center">
					<h2 className="text-3xl font-bold tracking-tight">Categories</h2>
					<p className="mt-2 text-muted-foreground">Browse items by category</p>
				</div>

				<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
					<CategoryCard
						title="Ranks"
						description="Exclusive ranks with special permissions"
						href="/store/category/ranks"
						imageSrc="/images/ranks.jpg"
					/>
					<CategoryCard
						title="Cosmetics"
						description="Stand out with unique cosmetic items"
						href="/store/category/cosmetics"
						imageSrc="/images/cosmetics.jpg"
					/>
					<CategoryCard
						title="Gameplay"
						description="Enhance your gameplay experience"
						href="/store/category/gameplay"
						imageSrc="/images/gameplay.jpg"
					/>
					<CategoryCard
						title="Special Offers"
						description="Limited time deals and bundles"
						href="/store/category/special"
						imageSrc="/images/special.jpg"
					/>
				</div>
			</section>

			{/* FAQ Section */}
			<section className="py-16">
				<div className="mb-10 text-center">
					<h2 className="text-3xl font-bold tracking-tight">
						Frequently Asked Questions
					</h2>
					<p className="mt-2 text-muted-foreground">
						Have questions about our store? Find answers below
					</p>
				</div>

				<div className="mx-auto max-w-3xl space-y-4">
					<FaqItem
						question="How do I receive my purchased items?"
						answer="After completing your purchase, items are automatically added to your account. You may need to reconnect to the server to see them."
					/>
					<FaqItem
						question="Can I get a refund?"
						answer="We offer refunds within 24 hours of purchase if you haven't used the item. Contact our support team for assistance."
					/>
					<FaqItem
						question="How long do ranks last?"
						answer="Unless otherwise specified, ranks are permanent and will not expire."
					/>
					<FaqItem
						question="Can I transfer items to another account?"
						answer="Items are bound to the Minecraft account used during purchase and cannot be transferred."
					/>
				</div>
			</section>
		</>
	);
}

function CategoryCard({
	title,
	description,
	href,
	imageSrc,
}: {
	title: string;
	description: string;
	href: string;
	imageSrc: string;
}) {
	return (
		<Link href={href} className="group relative overflow-hidden rounded-lg">
			<div className="relative h-48 w-full overflow-hidden">
				<Image
					src={imageSrc}
					alt={title}
					fill
					className="object-cover transition-transform duration-300 group-hover:scale-110"
				/>
				<div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
			</div>
			<div className="absolute bottom-0 left-0 right-0 p-4 text-white">
				<h3 className="text-xl font-bold">{title}</h3>
				<p className="mt-1 text-sm text-white/80">{description}</p>
			</div>
		</Link>
	);
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
	return (
		<div className="rounded-lg border p-4">
			<h3 className="text-lg font-medium">{question}</h3>
			<p className="mt-2 text-muted-foreground">{answer}</p>
		</div>
	);
}
