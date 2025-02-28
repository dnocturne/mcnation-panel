import { get, post, put, del } from './api-client';
import { StoreItem, StoreCategory, StorePaymentMethod } from '@/lib/types/store';

const API_BASE = '/api/webstore';

/**
 * Fetch all store items with optional category filtering
 */
export async function fetchStoreItems(categoryId?: number) {
  const url = categoryId 
    ? `${API_BASE}/items?categoryId=${categoryId}` 
    : `${API_BASE}/items`;
  return get<StoreItem[]>(url);
}

/**
 * Fetch a single store item by ID
 */
export async function fetchStoreItemById(itemId: number) {
  return get<StoreItem>(`${API_BASE}/items/${itemId}`);
}

/**
 * Fetch all store categories
 */
export async function fetchStoreCategories() {
  return get<StoreCategory[]>(`${API_BASE}/categories`);
}

/**
 * Fetch all payment methods
 */
export async function fetchPaymentMethods() {
  return get<StorePaymentMethod[]>(`${API_BASE}/payment-methods`);
}

/**
 * Create a new store item
 */
export async function createStoreItem(item: Omit<StoreItem, 'id'>) {
  return post<StoreItem>(`${API_BASE}/items`, item);
}

/**
 * Update an existing store item
 */
export async function updateStoreItem(id: number, item: Partial<StoreItem>) {
  return put<StoreItem>(`${API_BASE}/items/${id}`, item);
}

/**
 * Delete a store item
 */
export async function deleteStoreItem(id: number) {
  return del<void>(`${API_BASE}/items/${id}`);
}

/**
 * Submit an order
 */
export interface OrderSubmission {
  items: { item_id: number; quantity: number }[];
  payment_method_id: number;
  username: string;
  discount_code?: string;
}

export interface OrderResponse {
  order_id: number;
  total: number;
  success: boolean;
}

export async function submitOrder(orderData: OrderSubmission) {
  return post<OrderResponse>(`${API_BASE}/orders`, orderData);
}

/**
 * Fetch all available discount codes
 */
export async function fetchDiscounts() {
  try {
    const response = await fetch('/api/webstore/discounts', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies for NextAuth session
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.error || `Failed to fetch discounts: ${response.status} ${response.statusText}`,
        status: response.status,
      };
    }

    const data = await response.json();
    return {
      success: true,
      data: data.discounts || [],
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to fetch discounts',
    };
  }
} 