import useSWR from 'swr';
import { StorePaymentMethod } from '@/lib/types/store';
import { fetchPaymentMethods } from '@/lib/api/store-api';

interface UsePaymentMethodsOptions {
  revalidateOnFocus?: boolean;
  refreshInterval?: number;
}

/**
 * Custom hook for fetching payment methods with SWR caching
 */
export function usePaymentMethods(options: UsePaymentMethodsOptions = {}) {
  const { revalidateOnFocus = true, refreshInterval } = options;
  
  const { data, error, isLoading, mutate } = useSWR(
    '/api/webstore/payment-methods',
    async () => {
      const response = await fetchPaymentMethods();
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch payment methods');
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
    paymentMethods: data as StorePaymentMethod[] | undefined,
    isLoading,
    isError: error,
    refresh: mutate
  };
} 