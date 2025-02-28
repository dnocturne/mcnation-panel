import useSWR from 'swr';
import { StoreDiscount } from '@/lib/types/store';
import { fetchDiscounts } from '@/lib/api/store-api';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface UseStoreDiscountsOptions {
  revalidateOnFocus?: boolean;
  refreshInterval?: number;
  requireAuth?: boolean;
}

/**
 * Custom hook for fetching store discounts with SWR caching
 */
export function useStoreDiscounts(options: UseStoreDiscountsOptions = {}) {
  const { 
    revalidateOnFocus = true, 
    refreshInterval,
    requireAuth = true 
  } = options;
  
  const router = useRouter();
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';
  const isAdmin = isAuthenticated && session?.user?.role === 'admin';
  
  // Don't fetch data if auth is required but user isn't authenticated
  const shouldFetch = !requireAuth || isAuthenticated;
  
  const { data, error, isLoading, mutate } = useSWR(
    shouldFetch ? '/api/webstore/discounts' : null,
    async () => {
      try {
        const response = await fetchDiscounts();
        if (!response.success) {
          throw new Error(response.error || 'Failed to fetch discounts');
        }
        return response.data || [];
      } catch (error: any) {
        // Handle authentication errors
        if (error.status === 401 || error.message?.includes('unauthorized')) {
          // Redirect to login if authentication is required
          if (requireAuth) {
            router.push('/auth/login?redirect=/admin/store/discounts');
          }
        }
        throw error;
      }
    },
    {
      revalidateOnFocus,
      refreshInterval,
      dedupingInterval: 10000, // 10 seconds
      shouldRetryOnError: (err) => {
        // Don't retry on auth errors
        return !(err.status === 401 || err.message?.includes('unauthorized'));
      }
    }
  );
  
  return {
    discounts: data as StoreDiscount[] | undefined,
    isLoading,
    isError: error,
    refresh: mutate,
    isAuthenticated,
    isAdmin
  };
} 