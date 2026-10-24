import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import COLORS from '../../constants/colors';
import Header from '../../components/Header';
import Badge from '../../components/Badge';
import { ProductListSkeleton } from '../../components/Skeleton';
import { useProducts, Product } from '../../context/ProductContext';
import { useProductsQuery } from '../../api/queries';
import { useCart } from '../../context/CartContext';
import { useTranslation } from 'react-i18next';

interface ProductListScreenProps {
  navigation: any;
  route: any;
}

export const ProductListScreen: React.FC<ProductListScreenProps> = ({
  navigation,
  route,
}) => {
  const {
    categories,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    inStockOnly,
    setInStockOnly,
    products: fallbackProducts,
  } = useProducts();
  const { addToCart, itemCount } = useCart();
  const { t } = useTranslation();

  const { data: serverProducts, isLoading, isRefetching, refetch } = useProductsQuery({
    category: selectedCategory !== 'All' ? selectedCategory : undefined,
    search: searchQuery ? searchQuery : undefined,
    sort: sortBy !== 'none' ? sortBy : undefined,
    inStock: inStockOnly ? true : undefined,
  });

  const [showFilters, setShowFilters] = useState(false);

  // Compute products from query or fallback
  const hasCachedProducts = Array.isArray(serverProducts) && serverProducts.length > 0;
  const allProducts = hasCachedProducts ? serverProducts : fallbackProducts;
  const filteredProducts = allProducts.filter((p) => {
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

  const renderProductItem = ({ item }: { item: Product }) => {
    const isOutOfStock = item.stock <= 0;

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('ProductDetails', { productId: item.id })}
      >
        <Image source={{ uri: item.imageUrl }} style={styles.image} />
        <View style={styles.content}>
          <View style={styles.topRow}>
            <Text style={styles.categoryBadge}>{item.category}</Text>
            <Badge
              label={isOutOfStock ? 'OUT OF STOCK' : item.stock <= 3 ? 'LOW STOCK' : 'IN STOCK'}
              variant={isOutOfStock ? 'outline' : 'yellow'}
              size="small"
            />
          </View>
          <Text style={styles.title} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={styles.price}>{item.price.toLocaleString()} RWF</Text>
          <Text style={styles.stockText}>Stock: {item.stock} units</Text>

          <TouchableOpacity
            style={[styles.addBtn, isOutOfStock && styles.addBtnDisabled]}
            disabled={isOutOfStock}
            onPress={() => addToCart(item, 1)}
          >
            <Text style={styles.addBtnText}>
              {isOutOfStock ? 'OUT OF STOCK' : '+ ADD TO CART'}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title="PRODUCTS CATALOG"
        subtitle="Rwamagana Store"
        showBack={navigation.canGoBack()}
        onBack={() => navigation.goBack()}
        cartCount={itemCount}
        onCartPress={() => navigation.navigate('CartTab')}
      />

      {/* Search & Filter Header */}
      <View style={styles.controlBar}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={16} color={COLORS.blue} style={{ marginRight: 6 }} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('common.search')}
            placeholderTextColor={COLORS.blue}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={COLORS.blue} />
            </TouchableOpacity>
          ) : null}
        </View>
        <TouchableOpacity
          style={[styles.filterToggleBtn, showFilters && styles.filterToggleActive]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons
            name={showFilters ? 'chevron-up' : 'chevron-down'}
            size={14}
            color={COLORS.blue}
            style={{ marginRight: 4 }}
          />
          <Text style={styles.filterToggleText}>FILTERS</Text>
        </TouchableOpacity>
      </View>

      {/* Expandable Filter / Sort Tray */}
      {showFilters && (
        <View style={styles.filterTray}>
          <Text style={styles.filterSectionTitle}>Categories:</Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={categories}
            keyExtractor={(item) => item}
            contentContainerStyle={styles.categoryFilters}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.filterPill,
                  selectedCategory === item && styles.filterPillActive,
                ]}
                onPress={() => setSelectedCategory(item)}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    selectedCategory === item && styles.filterPillTextActive,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            )}
          />

          <View style={styles.sortRow}>
            <Text style={styles.filterSectionTitle}>Sort Price:</Text>
            <TouchableOpacity
              style={[
                styles.sortBtn,
                sortBy === 'price_asc' && styles.sortBtnActive,
              ]}
              onPress={() => setSortBy(sortBy === 'price_asc' ? 'none' : 'price_asc')}
            >
              <Text style={styles.sortBtnText}>Lowest First</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.sortBtn,
                sortBy === 'price_desc' && styles.sortBtnActive,
              ]}
              onPress={() => setSortBy(sortBy === 'price_desc' ? 'none' : 'price_desc')}
            >
              <Text style={styles.sortBtnText}>Highest First</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.stockToggleRow}
            onPress={() => setInStockOnly(!inStockOnly)}
          >
            <View style={[styles.checkbox, inStockOnly && styles.checkboxActive]}>
              {inStockOnly && <Ionicons name="checkmark" size={14} color={COLORS.blue} />}
            </View>
            <Text style={styles.stockToggleLabel}>Show In-Stock Products Only</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Products List or Skeleton */}
      {isLoading && !hasCachedProducts ? (
        <ProductListSkeleton count={4} />
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderProductItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => {
                refetch();
              }}
              colors={[COLORS.blue]}
              tintColor={COLORS.blue}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="cube-outline" size={48} color={COLORS.blue} style={{ marginBottom: 12 }} />
              <Text style={styles.emptyTitle}>No Products Found</Text>
              <Text style={styles.emptySub}>
                Try adjusting your search query or department filters.
              </Text>
              <TouchableOpacity
                style={styles.resetBtn}
                onPress={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setInStockOnly(false);
                  setSortBy('none');
                }}
              >
                <Text style={styles.resetBtnText}>Reset All Filters</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  controlBar: {
    padding: 12,
    borderBottomWidth: 1.5,
    borderBottomColor: COLORS.blue,
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderColor: COLORS.blue,
    borderWidth: 2,
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 42,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    color: COLORS.blue,
    fontSize: 13,
    fontWeight: '600',
  },
  clearIcon: {
    fontSize: 14,
    color: COLORS.blue,
    fontWeight: 'bold',
    padding: 4,
  },
  filterToggleBtn: {
    backgroundColor: COLORS.yellow,
    borderColor: COLORS.blue,
    borderWidth: 2,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  filterToggleActive: {
    backgroundColor: COLORS.blue,
  },
  filterToggleText: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.blue,
  },
  filterTray: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.blue,
    borderBottomWidth: 2,
    padding: 12,
  },
  filterSectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.blue,
    marginBottom: 6,
  },
  categoryFilters: {
    gap: 8,
    paddingBottom: 10,
  },
  filterPill: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.blue,
    borderWidth: 1.5,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 6,
  },
  filterPillActive: {
    backgroundColor: COLORS.yellow,
    borderColor: COLORS.blue,
    borderWidth: 2,
  },
  filterPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.blue,
  },
  filterPillTextActive: {
    color: COLORS.blue,
    fontWeight: '900',
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 6,
  },
  sortBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: COLORS.blue,
    backgroundColor: COLORS.white,
  },
  sortBtnActive: {
    backgroundColor: COLORS.yellow,
  },
  sortBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.blue,
  },
  stockToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.blue,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  checkboxActive: {
    backgroundColor: COLORS.yellow,
  },
  checkboxCheck: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.blue,
  },
  stockToggleLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.blue,
  },
  listContent: {
    padding: 14,
    gap: 14,
  },
  card: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.blue,
    borderWidth: 2,
    borderRadius: 12,
    overflow: 'hidden',
    flexDirection: 'row',
    marginBottom: 12,
  },
  image: {
    width: 120,
    height: '100%',
    minHeight: 140,
    backgroundColor: COLORS.white,
  },
  content: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.blue,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.blue,
    marginBottom: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.blue,
  },
  stockText: {
    fontSize: 11,
    color: COLORS.blue,
    opacity: 0.8,
    marginVertical: 4,
  },
  addBtn: {
    backgroundColor: COLORS.blue,
    borderColor: COLORS.yellow,
    borderWidth: 1.5,
    borderRadius: 6,
    paddingVertical: 6,
    alignItems: 'center',
    marginTop: 4,
  },
  addBtnDisabled: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.blue,
  },
  addBtnText: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.yellow,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.blue,
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    color: COLORS.blue,
    textAlign: 'center',
    marginBottom: 16,
  },
  resetBtn: {
    backgroundColor: COLORS.yellow,
    borderColor: COLORS.blue,
    borderWidth: 2,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  resetBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.blue,
  },
});

export default ProductListScreen;
