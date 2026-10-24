import { QueryClient, focusManager } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { AppState, AppStateStatus, Platform } from 'react-native';

/**
 * Standard Query Keys Hierarchy for D&G E-Commerce
 */
export const QUERY_KEYS = {
  // Client queries
  products: ['products'] as const,
  product: (id: number | string) => ['product', String(id)] as const,
  categories: ['categories'] as const,
  profile: ['profile'] as const,
  orders: ['orders'] as const,
  order: (id: string) => ['order', id] as const,
  cart: ['cart'] as const,

  // Seller/Owner queries
  sellerInventory: ['seller', 'inventory'] as const,
  sellerSales: (period?: string) => ['seller', 'sales', period || '7days'] as const,
  sellerOrders: (status?: string) => ['seller', 'orders', status || 'all'] as const,
};

/**
 * Freshness Durations (staleTime) & Cache Garbage Collection (gcTime)
 * Tuned specifically for retail store operations in Rwamagana:
 * - Categories: 30 minutes
 * - Products catalog: 2 minutes
 * - Product details: 5 minutes
 * - Inventory: 30 seconds
 * - Order status & tracking: 20 seconds
 * - Sales reports: 1 minute
 * - Profile: 5 minutes
 */
export const CACHE_TIMES = {
  categories: {
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
  },
  products: {
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 60 * 12, // 12 hours
  },
  productDetails: {
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 60 * 6, // 6 hours
  },
  inventory: {
    staleTime: 1000 * 30, // 30 seconds
    gcTime: 1000 * 60 * 10, // 10 minutes
  },
  orders: {
    staleTime: 1000 * 20, // 20 seconds
    gcTime: 1000 * 60 * 30, // 30 minutes
  },
  orderTracking: {
    staleTime: 1000 * 15, // 15 seconds
    gcTime: 1000 * 60 * 15, // 15 minutes
  },
  sales: {
    staleTime: 1000 * 60, // 1 minute
    gcTime: 1000 * 60 * 10, // 10 minutes
  },
  profile: {
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  },
};

/**
 * Centralized QueryClient configured for React Native
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: CACHE_TIMES.products.staleTime,
      gcTime: CACHE_TIMES.products.gcTime,
      retry: (failureCount, error: any) => {
        // Do not retry 401 Unauthorized or 403 Forbidden
        const status = error?.status || error?.response?.status;
        if (status === 401 || status === 403 || status === 404) {
          return false;
        }
        return failureCount < 2;
      },
      refetchOnWindowFocus: Platform.OS !== 'web' ? false : true,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: false,
    },
  },
});

/**
 * AsyncStorage persister for non-sensitive public/catalog cached queries.
 * Bounded with throttle to prevent unnecessary disk writes.
 */
export const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: '@dg_query_cache',
  throttleTime: 1000,
  // Only persist public, non-sensitive queries to storage:
  // Products, categories. Do NOT persist private seller reports, auth tokens, or payment details.
  serialize: (client) => {
    try {
      const filteredClient = {
        ...client,
        clientState: {
          ...client.clientState,
          queries: client.clientState.queries.filter((q) => {
            const firstKey = q.queryKey[0];
            return firstKey === 'products' || firstKey === 'categories' || firstKey === 'product';
          }),
        },
      };
      return JSON.stringify(filteredClient);
    } catch {
      return JSON.stringify(client);
    }
  },
});

/**
 * Automatic background/foreground synchronization via React Native AppState
 */
export function setupQueryFocusManager() {
  const onAppStateChange = (status: AppStateStatus) => {
    if (Platform.OS !== 'web') {
      focusManager.setFocused(status === 'active');
    }
  };

  const subscription = AppState.addEventListener('change', onAppStateChange);
  return () => {
    subscription.remove();
  };
}

/**
 * Invalidate all user-specific queries on logout or role switch
 */
export async function clearUserSpecificCache() {
  await queryClient.cancelQueries();
  queryClient.removeQueries({ queryKey: QUERY_KEYS.profile });
  queryClient.removeQueries({ queryKey: QUERY_KEYS.orders });
  queryClient.removeQueries({ queryKey: ['seller'] });
  queryClient.removeQueries({ queryKey: QUERY_KEYS.cart });
}

export default queryClient;
