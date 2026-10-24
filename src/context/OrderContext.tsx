import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '../api/client';
import { OrderStage } from '../components/Timeline';

export interface OrderItem {
  id?: number;
  productId: number;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

export interface Order {
  id: string; // Order Number e.g. DG-ORD-2026-001
  createdAt: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  district: string;
  paymentMethod: 'Cash on Delivery' | 'Mobile Money';
  paymentStatus: 'Pending' | 'Paid';
  status: OrderStage | 'cancelled';
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
}

const INITIAL_ORDERS: Order[] = [
  {
    id: 'DG-ORD-2026-001',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    customerName: 'Jean Claude Uwase',
    customerPhone: '+250 788 123 456',
    deliveryAddress: 'Near Rwamagana District Hospital, Sector Kigabiro',
    district: 'Rwamagana',
    paymentMethod: 'Cash on Delivery',
    paymentStatus: 'Pending',
    status: 'processing',
    items: [
      {
        productId: 1,
        name: 'Smart Men Casual Shirt',
        price: 18000,
        quantity: 2,
        imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&q=80',
      },
    ],
    subtotal: 36000,
    deliveryFee: 0,
    total: 36000,
  },
  {
    id: 'DG-ORD-2026-002',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    customerName: 'Aline Mukamana',
    customerPhone: '+250 783 999 888',
    deliveryAddress: 'Rwamagana Main Market, Stall 44',
    district: 'Rwamagana',
    paymentMethod: 'Mobile Money',
    paymentStatus: 'Paid',
    status: 'delivered',
    items: [
      {
        productId: 3,
        name: 'Classic Leather Oxford Shoes',
        price: 45000,
        quantity: 1,
        imageUrl: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=500&q=80',
      },
    ],
    subtotal: 45000,
    deliveryFee: 0,
    total: 45000,
  },
];

interface OrderContextValue {
  orders: Order[];
  isLoading: boolean;
  createOrder: (orderData: Omit<Order, 'id' | 'createdAt' | 'status'>) => Promise<Order>;
  updateOrderStatus: (orderId: string, newStatus: OrderStage | 'cancelled') => Promise<boolean>;
  getOrderById: (orderId: string) => Order | undefined;
  refreshOrders: () => Promise<void>;
}

const OrderContext = createContext<OrderContextValue | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const stored = await AsyncStorage.getItem('@dg_orders');
        if (stored) {
          setOrders(JSON.parse(stored));
        }
      } catch (e) {
        console.warn('Failed to load orders from storage');
      }
    };
    loadOrders().then(() => {
      refreshOrders();
    });
  }, []);

  const saveOrders = (updated: Order[]) => {
    setOrders(updated);
    AsyncStorage.setItem('@dg_orders', JSON.stringify(updated)).catch((e) =>
      console.warn('Failed to persist orders', e)
    );
  };

  const createOrder = async (
    orderData: Omit<Order, 'id' | 'createdAt' | 'status'>
  ): Promise<Order> => {
    setIsLoading(true);
    const orderNumber = `DG-ORD-${new Date().getFullYear()}-${String(
      orders.length + 1
    ).padStart(3, '0')}`;

    const newOrder: Order = {
      ...orderData,
      id: orderNumber,
      createdAt: new Date().toISOString(),
      status: 'placed',
    };

    try {
      await apiClient.post('/orders', newOrder);
    } catch (e) {
      console.log('Order registered locally');
    }

    const updated = [newOrder, ...orders];
    saveOrders(updated);
    setIsLoading(false);
    return newOrder;
  };

  const updateOrderStatus = async (
    orderId: string,
    newStatus: OrderStage | 'cancelled'
  ): Promise<boolean> => {
    try {
      await apiClient.put(`/orders/${orderId}/status`, { status: newStatus });
    } catch (e) {
      console.log('Order status updated locally');
    }

    const updated = orders.map((o) =>
      o.id === orderId
        ? {
            ...o,
            status: newStatus,
            paymentStatus: newStatus === 'delivered' ? ('Paid' as const) : o.paymentStatus,
          }
        : o
    );
    saveOrders(updated);
    return true;
  };

  const getOrderById = (orderId: string) => orders.find((o) => o.id === orderId);

  const refreshOrders = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get('/orders');
      if (res.data && Array.isArray(res.data)) {
        saveOrders(res.data);
      }
    } catch (e) {
      console.log('Using local orders');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        isLoading,
        createOrder,
        updateOrderStatus,
        getOrderById,
        refreshOrders,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = (): OrderContextValue => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};

export default OrderContext;
