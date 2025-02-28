import useSWR from 'swr';
import { StoreItem } from '@/lib/types/store';
import { fetchStoreItemById } from '@/lib/api/store-api';

interface UseStoreItemOptions {
  revalidateOnFocus?: boolean;
  refreshInterval?: number;
}

/**
 * Custom hook for fetching a single store item with SWR caching
 */
export function useStoreItem(itemId: number, options: UseStoreItemOptions = {}) {
  const { revalidateOnFocus = true, refreshInterval } = options;
  
  const { data, error, isLoading, mutate } = useSWR(
    itemId ? `/api/webstore/items/${itemId}` : null,
    async () => {
      const response = await fetchStoreItemById(itemId);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch store item');
      }
      return response.data;
    },
    {
      revalidateOnFocus,
      refreshInterval,
      dedupingInterval: 10000, // 10 seconds
    }
  );
  
  return {
    item: data as StoreItem | undefined,
    isLoading,
    isError: error,
    refresh: mutate
  };
} 