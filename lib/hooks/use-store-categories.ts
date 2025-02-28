import useSWR from 'swr';
import { StoreCategory } from '@/lib/types/store';
import { fetchStoreCategories } from '@/lib/api/store-api';

interface UseStoreCategoriesOptions {
  revalidateOnFocus?: boolean;
  refreshInterval?: number;
}

/**
 * Custom hook for fetching store categories with SWR caching
 */
export function useStoreCategories(options: UseStoreCategoriesOptions = {}) {
  const { revalidateOnFocus = true, refreshInterval } = options;
  
  const { data, error, isLoading, mutate } = useSWR(
    '/api/webstore/categories',
    async () => {
      const response = await fetchStoreCategories();
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch store categories');
      }
      return response.data || [];
    },
    {
      revalidateOnFocus,
      refreshInterval,
      dedupingInterval: 10000, // 10 seconds
    }
  );
  
  return {
    categories: data as StoreCategory[] | undefined,
    isLoading,
    isError: error,
    refresh: mutate
  };
} 