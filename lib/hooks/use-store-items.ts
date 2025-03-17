import useSWR from "swr";
import type { StoreItem } from "@/lib/types/store";
import { fetchStoreItems } from "@/lib/api/store-api";

interface UseStoreItemsOptions {
	categoryId?: number;
	revalidateOnFocus?: boolean;
	refreshInterval?: number;
}

/**
 * Custom hook for fetching store items with SWR caching
 */
export function useStoreItems(options: UseStoreItemsOptions = {}) {
	const { categoryId, revalidateOnFocus = true, refreshInterval } = options;

	const cacheKey = categoryId
		? `/api/webstore/items?categoryId=${categoryId}`
		: "/api/webstore/items";

	const { data, error, isLoading, mutate } = useSWR(
		cacheKey,
		async () => {
			const response = await fetchStoreItems(categoryId);
			if (!response.success) {
				throw new Error(response.error || "Failed to fetch store items");
			}
			return response.data || [];
		},
		{
			revalidateOnFocus,
			refreshInterval,
			dedupingInterval: 10000, // 10 seconds
		},
	);

	return {
		items: data as StoreItem[] | undefined,
		isLoading,
		isError: error,
		refresh: mutate,
	};
}
