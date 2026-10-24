import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../api/client';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number; // in RWF
  stock: number;
  category: string;
  imageUrl: string;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  sku?: string;
}

// Initial D&G E-Commerce Catalog Data for Rwamagana
const INITIAL_PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Smart Men Casual Shirt',
    description: 'High-quality cotton casual buttoned shirt. Breathable and durable for work or casual events.',
    price: 18000,
    stock: 25,
    category: 'Clothes',
    imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&q=80',
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: true,
    sku: 'DG-CLO-001',
  },
  {
    id: 2,
    name: 'Elegant Women Summer Dress',
    description: 'Vibrant patterned comfortable dress made from premium breathable fabrics.',
    price: 24000,
    stock: 14,
    category: 'Clothes',
    imageUrl: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500&q=80',
    isFeatured: true,
    isNewArrival: false,
    isBestSeller: true,
    sku: 'DG-CLO-002',
  },
  {
    id: 3,
    name: 'Classic Leather Oxford Shoes',
    description: 'Genuine leather executive shoes with padded inner soles for supreme comfort.',
    price: 45000,
    stock: 8,
    category: 'Shoes',
    imageUrl: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=500&q=80',
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: true,
    sku: 'DG-SHO-001',
  },
  {
    id: 4,
    name: 'Comfortable Daily Sneakers',
    description: 'Lightweight cushioned unisex sports and leisure sneakers.',
    price: 28000,
    stock: 2, // low stock test
    category: 'Shoes',
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80',
    isFeatured: false,
    isNewArrival: true,
    isBestSeller: false,
    sku: 'DG-SHO-002',
  },
  {
    id: 5,
    name: 'Leather Business Laptop Backpack',
    description: 'Water-resistant compartments for laptops up to 15.6 inches with multiple secure pockets.',
    price: 32000,
    stock: 12,
    category: 'Bags',
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80',
    isFeatured: true,
    isNewArrival: false,
    isBestSeller: true,
    sku: 'DG-BAG-001',
  },
  {
    id: 6,
    name: 'Stainless Steel Electric Kettle 2.0L',
    description: 'Fast-boiling automatic shut-off kettle with boil-dry safety protection.',
    price: 19500,
    stock: 18,
    category: 'Household Equipment',
    imageUrl: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=500&q=80',
    isFeatured: false,
    isNewArrival: true,
    isBestSeller: false,
    sku: 'DG-HOU-001',
  },
  {
    id: 7,
    name: 'Gold Plated Luxury Pendant Necklace',
    description: 'Tarnish-resistant fine jewelry piece designed for banquets and celebrations.',
    price: 15000,
    stock: 0, // out of stock test
    category: 'Jewellery',
    imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&q=80',
    isFeatured: true,
    isNewArrival: false,
    isBestSeller: false,
    sku: 'DG-JEW-001',
  },
  {
    id: 8,
    name: 'Organic Shea Butter Moisturizer',
    description: 'Natural soothing skin hydration cream suitable for all tropical skin types.',
    price: 8500,
    stock: 30,
    category: 'Cosmetics',
    imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&q=80',
    isFeatured: false,
    isNewArrival: true,
    isBestSeller: true,
    sku: 'DG-COS-001',
  },
];

interface ProductContextValue {
  products: Product[];
  categories: string[];
  isLoading: boolean;
  searchQuery: string;
  selectedCategory: string;
  sortBy: 'none' | 'price_asc' | 'price_desc' | 'newest';
  inStockOnly: boolean;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string) => void;
  setSortBy: (sort: 'none' | 'price_asc' | 'price_desc' | 'newest') => void;
  setInStockOnly: (val: boolean) => void;
  filteredProducts: Product[];
  addProduct: (product: Omit<Product, 'id'>) => Promise<boolean>;
  updateProduct: (id: number, product: Partial<Product>) => Promise<boolean>;
  deleteProduct: (id: number) => Promise<boolean>;
  refreshProducts: () => Promise<void>;
  getProductById: (id: number) => Product | undefined;
}

const ProductContext = createContext<ProductContextValue | undefined>(undefined);

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'none' | 'price_asc' | 'price_desc' | 'newest'>('none');
  const [inStockOnly, setInStockOnly] = useState(false);

  const categories = [
    'All',
    'Clothes',
    'Shoes',
    'Bags',
    'Household Equipment',
    'Jewellery',
    'Cosmetics',
  ];

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get('/products');
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        setProducts(res.data);
      }
    } catch (e) {
      // Fallback to local catalog if server isn't reached yet
      console.log('Using local catalog fallback for products');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const addProduct = async (prod: Omit<Product, 'id'>): Promise<boolean> => {
    try {
      const res = await apiClient.post('/products', prod);
      if (res.data) {
        setProducts((prev) => [res.data, ...prev]);
        return true;
      }
    } catch (e) {
      // Local optimistic add
      const newId = Math.max(...products.map((p) => p.id), 0) + 1;
      const newProduct: Product = { ...prod, id: newId };
      setProducts((prev) => [newProduct, ...prev]);
      return true;
    }
    return false;
  };

  const updateProduct = async (id: number, updates: Partial<Product>): Promise<boolean> => {
    try {
      await apiClient.put(`/products/${id}`, updates);
    } catch (e) {
      console.log('Updating product locally');
    }
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
    return true;
  };

  const deleteProduct = async (id: number): Promise<boolean> => {
    try {
      await apiClient.delete(`/products/${id}`);
    } catch (e) {
      console.log('Deleting product locally');
    }
    setProducts((prev) => prev.filter((p) => p.id !== id));
    return true;
  };

  const getProductById = (id: number) => products.find((p) => p.id === id);

  // Compute filtered & sorted product list
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      searchQuery.trim() === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All' || p.category === selectedCategory;

    const matchesStock = !inStockOnly || p.stock > 0;

    return matchesSearch && matchesCategory && matchesStock;
  }).sort((a, b) => {
    if (sortBy === 'price_asc') return a.price - b.price;
    if (sortBy === 'price_desc') return b.price - a.price;
    if (sortBy === 'newest') return (b.id) - (a.id);
    return 0;
  });

  return (
    <ProductContext.Provider
      value={{
        products,
        categories,
        isLoading,
        searchQuery,
        selectedCategory,
        sortBy,
        inStockOnly,
        setSearchQuery,
        setSelectedCategory,
        setSortBy,
        setInStockOnly,
        filteredProducts,
        addProduct,
        updateProduct,
        deleteProduct,
        refreshProducts: fetchProducts,
        getProductById,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = (): ProductContextValue => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};

export default ProductContext;
