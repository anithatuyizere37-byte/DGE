import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { QUERY_KEYS, CACHE_TIMES } from '../api/queryClient';
import { Product } from '../context/ProductContext';
import { Order } from '../context/OrderContext';

/**
 * Fetch all products with caching and background sync
 */
export function useProductsQuery(params?: {
  category?: string;
  search?: string;
  sort?: string;
  inStock?: boolean;
}) {
  return useQuery<Product[]>({
    queryKey: [...QUERY_KEYS.products, params],
    queryFn: async () => {
      const res = await apiClient.get('/products', { params });
      return res.data;
    },
    staleTime: CACHE_TIMES.products.staleTime,
    gcTime: CACHE_TIMES.products.gcTime,
    // Automatic periodic refresh while catalog screen is active (2 minutes)
    refetchInterval: 1000 * 60 * 2,
    refetchIntervalInBackground: false,
  });
}

/**
 * Fetch single product details by id
 */
export function useProductDetailsQuery(productId: number | string, initialData?: Product) {
  return useQuery<Product>({
    queryKey: QUERY_KEYS.product(productId),
    queryFn: async () => {
      const res = await apiClient.get(`/products/${productId}`);
      return res.data;
    },
    initialData,
    staleTime: CACHE_TIMES.productDetails.staleTime,
    gcTime: CACHE_TIMES.productDetails.gcTime,
    enabled: !!productId,
  });
}

/**
 * Fetch categories
 */
export function useCategoriesQuery() {
  return useQuery<string[]>({
    queryKey: QUERY_KEYS.categories,
    queryFn: async () => {
      const res = await apiClient.get('/categories');
      if (Array.isArray(res.data)) {
        return res.data.map((c: any) => (typeof c === 'string' ? c : c.name));
      }
      return [
        'Clothes',
        'Shoes',
        'Bags',
        'Household Equipment',
        'Jewellery',
        'Cosmetics',
      ];
    },
    staleTime: CACHE_TIMES.categories.staleTime,
    gcTime: CACHE_TIMES.categories.gcTime,
  });
}

/**
 * Fetch Customer / Owner orders
 */
export function useOrdersQuery(status?: string) {
  return useQuery<Order[]>({
    queryKey: status ? [...QUERY_KEYS.orders, { status }] : QUERY_KEYS.orders,
    queryFn: async () => {
      const res = await apiClient.get('/orders', { params: { status } });
      return res.data;
    },
    staleTime: CACHE_TIMES.orders.staleTime,
    gcTime: CACHE_TIMES.orders.gcTime,
    // Background polling every 20 seconds while order screen is active
    refetchInterval: 1000 * 20,
    refetchIntervalInBackground: false,
  });
}

/**
 * Fetch single order with live status tracking
 */
export function useOrderTrackingQuery(orderId: string, isFinalStage: boolean = false) {
  return useQuery<Order>({
    queryKey: QUERY_KEYS.order(orderId),
    queryFn: async () => {
      const res = await apiClient.get(`/orders/${orderId}`);
      return res.data;
    },
    staleTime: CACHE_TIMES.orderTracking.staleTime,
    gcTime: CACHE_TIMES.orderTracking.gcTime,
    // Conditional polling: stop polling once delivered or cancelled!
    refetchInterval: isFinalStage ? false : 1000 * 15,
    refetchIntervalInBackground: false,
    enabled: !!orderId,
  });
}

/**
 * Seller Inventory Query with 30s freshness and periodic polling
 */
export function useSellerInventoryQuery() {
  return useQuery<Product[]>({
    queryKey: QUERY_KEYS.sellerInventory,
    queryFn: async () => {
      const res = await apiClient.get('/products');
      return res.data;
    },
    staleTime: CACHE_TIMES.inventory.staleTime,
    gcTime: CACHE_TIMES.inventory.gcTime,
    refetchInterval: 1000 * 30, // 30 seconds while on inventory screen
    refetchIntervalInBackground: false,
  });
}

/**
 * Seller Sales Report Query
 */
export function useSellerSalesQuery(period: 'today' | '7days' | '30days' = '7days') {
  return useQuery({
    queryKey: QUERY_KEYS.sellerSales(period),
    queryFn: async () => {
      const res = await apiClient.get('/reports/sales', { params: { period } });
      return res.data;
    },
    staleTime: CACHE_TIMES.sales.staleTime,
    gcTime: CACHE_TIMES.sales.gcTime,
    refetchInterval: 1000 * 60, // 1 minute
    refetchIntervalInBackground: false,
  });
}

/**
 * Product Mutations with Automatic Cache Invalidation
 */
export function useProductMutations() {
  const queryClient = useQueryClient();

  const createProduct = useMutation({
    mutationFn: async (newProduct: Omit<Product, 'id'>) => {
      const res = await apiClient.post('/products', newProduct);
      return res.data;
    },
    onSuccess: () => {
      // Invalidate product catalog & seller inventory
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.products });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.sellerInventory });
    },
  });

  const updateProduct = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<Product> }) => {
      const res = await apiClient.put(`/products/${id}`, updates);
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.products });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.product(variables.id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.sellerInventory });
    },
  });

  const updateStock = useMutation({
    mutationFn: async ({ id, stock }: { id: number; stock: number }) => {
      const res = await apiClient.patch(`/products/${id}/stock`, { stock });
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.products });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.product(variables.id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.sellerInventory });
    },
  });

  const deleteProduct = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiClient.delete(`/products/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.products });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.sellerInventory });
    },
  });

  return {
    createProduct,
    updateProduct,
    updateStock,
    deleteProduct,
  };
}

/**
 * Order Mutations with Cache Invalidation & Stock Revalidation
 */
export function useOrderMutations() {
  const queryClient = useQueryClient();

  const createOrder = useMutation({
    mutationFn: async (orderData: any) => {
      const res = await apiClient.post('/orders', orderData);
      return res.data;
    },
    onSuccess: (data) => {
      // Invalidate customer orders, products (as stock decremented), and seller inventory
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orders });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.products });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.sellerInventory });
      if (data?.id) {
        queryClient.setQueryData(QUERY_KEYS.order(data.id), data);
      }
    },
  });

  const updateOrderStatus = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const res = await apiClient.put(`/orders/${orderId}/status`, { status });
      return res.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate orders list and the specific order tracking query
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orders });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.order(variables.orderId) });
      queryClient.invalidateQueries({ queryKey: ['seller'] });
    },
  });

  return {
    createOrder,
    updateOrderStatus,
  };
}
