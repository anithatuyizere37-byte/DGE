import { QUERY_KEYS, CACHE_TIMES } from '../src/api/queryClient';

describe('TanStack Query Caching & Synchronization Rules', () => {
  test('Query keys are consistent across features', () => {
    expect(QUERY_KEYS.products).toEqual(['products']);
    expect(QUERY_KEYS.product(10)).toEqual(['product', '10']);
    expect(QUERY_KEYS.categories).toEqual(['categories']);
    expect(QUERY_KEYS.profile).toEqual(['profile']);
    expect(QUERY_KEYS.orders).toEqual(['orders']);
    expect(QUERY_KEYS.order('DG-ORD-2026-001')).toEqual(['order', 'DG-ORD-2026-001']);
    expect(QUERY_KEYS.cart).toEqual(['cart']);
    expect(QUERY_KEYS.sellerInventory).toEqual(['seller', 'inventory']);
    expect(QUERY_KEYS.sellerSales('7days')).toEqual(['seller', 'sales', '7days']);
  });

  test('Freshness parameters match business dynamics in Rwamagana', () => {
    // Categories change rarely: 30 minutes
    expect(CACHE_TIMES.categories.staleTime).toBe(30 * 60 * 1000);

    // Products catalog: 2 minutes
    expect(CACHE_TIMES.products.staleTime).toBe(2 * 60 * 1000);

    // Live inventory: fast 30s freshness
    expect(CACHE_TIMES.inventory.staleTime).toBe(30 * 1000);

    // Order status tracking: fast 15-20s freshness
    expect(CACHE_TIMES.orderTracking.staleTime).toBe(15 * 1000);
    expect(CACHE_TIMES.orders.staleTime).toBe(20 * 1000);

    // Sales report: 1 minute
    expect(CACHE_TIMES.sales.staleTime).toBe(60 * 1000);
  });
});
