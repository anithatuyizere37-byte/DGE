import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CartItem {
  id: number;
  name: string;
  price: number; // in RWF
  quantity: number;
  imageUrl?: string;
  stock: number;
  category?: string;
}

interface CartState {
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
}

type CartAction =
  | { type: 'LOAD_CART'; items: CartItem[] }
  | { type: 'ADD_ITEM'; item: CartItem }
  | { type: 'REMOVE_ITEM'; id: number }
  | { type: 'UPDATE_QUANTITY'; id: number; quantity: number }
  | { type: 'CLEAR_CART' };

const STANDARD_DELIVERY_FEE = 1500; // 1,500 RWF within Rwamagana
const FREE_DELIVERY_THRESHOLD = 30000; // Free delivery for orders > 30,000 RWF

function calculateTotals(items: CartItem[]): {
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
} {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = items.length === 0 ? 0 : subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : STANDARD_DELIVERY_FEE;
  const discount = 0;
  const total = subtotal + deliveryFee - discount;
  return { subtotal, deliveryFee, discount, total };
}

function cartReducer(state: CartState, action: CartAction): CartState {
  let newItems: CartItem[] = [];

  switch (action.type) {
    case 'LOAD_CART':
      return {
        items: action.items,
        ...calculateTotals(action.items),
      };

    case 'ADD_ITEM': {
      const existingIndex = state.items.findIndex((i) => i.id === action.item.id);
      if (existingIndex > -1) {
        newItems = state.items.map((item, index) => {
          if (index === existingIndex) {
            const newQty = Math.min(item.quantity + action.item.quantity, item.stock);
            return { ...item, quantity: newQty };
          }
          return item;
        });
      } else {
        newItems = [...state.items, action.item];
      }
      return {
        items: newItems,
        ...calculateTotals(newItems),
      };
    }

    case 'REMOVE_ITEM':
      newItems = state.items.filter((i) => i.id !== action.id);
      return {
        items: newItems,
        ...calculateTotals(newItems),
      };

    case 'UPDATE_QUANTITY': {
      if (action.quantity <= 0) {
        newItems = state.items.filter((i) => i.id !== action.id);
      } else {
        newItems = state.items.map((item) => {
          if (item.id === action.id) {
            const cappedQty = Math.min(action.quantity, item.stock);
            return { ...item, quantity: cappedQty };
          }
          return item;
        });
      }
      return {
        items: newItems,
        ...calculateTotals(newItems),
      };
    }

    case 'CLEAR_CART':
      return {
        items: [],
        subtotal: 0,
        deliveryFee: 0,
        discount: 0,
        total: 0,
      };

    default:
      return state;
  }
}

const initialCartState: CartState = {
  items: [],
  subtotal: 0,
  deliveryFee: 0,
  discount: 0,
  total: 0,
};

interface CartContextValue extends CartState {
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialCartState);

  // Load saved cart on startup
  useEffect(() => {
    const loadCart = async () => {
      try {
        const stored = await AsyncStorage.getItem('@dg_cart');
        if (stored) {
          const items: CartItem[] = JSON.parse(stored);
          dispatch({ type: 'LOAD_CART', items });
        }
      } catch (e) {
        console.warn('Failed to load cart from AsyncStorage', e);
      }
    };
    loadCart();
  }, []);

  // Sync to AsyncStorage on changes
  useEffect(() => {
    AsyncStorage.setItem('@dg_cart', JSON.stringify(state.items)).catch((e) =>
      console.warn('Failed to save cart to AsyncStorage', e)
    );
  }, [state.items]);

  const addToCart = (item: Omit<CartItem, 'quantity'>, quantity = 1) => {
    dispatch({ type: 'ADD_ITEM', item: { ...item, quantity } });
  };

  const removeFromCart = (id: number) => {
    dispatch({ type: 'REMOVE_ITEM', id });
  };

  const updateQuantity = (id: number, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', id, quantity });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        ...state,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextValue => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
