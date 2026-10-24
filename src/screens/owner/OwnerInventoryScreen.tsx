import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import COLORS from '../../constants/colors';
import Header from '../../components/Header';
import Badge from '../../components/Badge';
import { ProductListSkeleton } from '../../components/Skeleton';
import { useProducts, Product } from '../../context/ProductContext';
import { useSellerInventoryQuery, useProductMutations } from '../../api/queries';
import { useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '../../api/queryClient';
import { useTranslation } from 'react-i18next';

export const OwnerInventoryScreen: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { products: localProducts, updateProduct: updateProductLocal } = useProducts();
  const { data: serverProducts, isLoading, isRefetching, refetch } = useSellerInventoryQuery();
  const { updateStock } = useProductMutations();
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all');

  const hasCachedProducts = Array.isArray(serverProducts) && serverProducts.length > 0;
  const products = hasCachedProducts ? serverProducts : localProducts;

  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 5);
  const outOfStock = products.filter((p) => p.stock === 0);

  const displayed = products.filter((p) => {
    if (filter === 'low') return p.stock > 0 && p.stock <= 5;
    if (filter === 'out') return p.stock === 0;
    return true;
  });

  const adjustStock = (product: Product, delta: number) => {
    const newStock = Math.max(0, product.stock + delta);
    // Instant local cache updates
    queryClient.setQueryData<Product[]>(QUERY_KEYS.sellerInventory, (old) =>
      old ? old.map((p) => (p.id === product.id ? { ...p, stock: newStock } : p)) : []
    );
    queryClient.setQueryData<Product[]>(QUERY_KEYS.products, (old) =>
      old ? old.map((p) => (p.id === product.id ? { ...p, stock: newStock } : p)) : []
    );
    updateProductLocal(product.id, { stock: newStock });
    updateStock.mutate({ id: product.id, stock: newStock });
  };

  const renderInventoryItem = ({ item }: { item: Product }) => {
    const isOut = item.stock === 0;
    const isLow = item.stock > 0 && item.stock <= 5;

    return (
      <View style={[styles.itemCard, isOut && styles.itemCardOut]}>
        <Image source={{ uri: item.imageUrl }} style={styles.image} />
        <View style={styles.itemDetails}>
          <View style={styles.topRow}>
            <Text style={styles.category}>{item.category}</Text>
            <Badge
              label={isOut ? t('home.outOfStock').toUpperCase() : isLow ? t('common.stockWarnings').toUpperCase() : t('home.inStock').toUpperCase()}
              variant={isOut ? 'outline' : 'yellow'}
              size="small"
            />
          </View>
          <Text style={styles.productName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.price}>{item.price.toLocaleString()} RWF</Text>

          {/* Quick Stock Controls */}
          <View style={styles.stockControlRow}>
            <Text style={styles.stockLabel}>{t('common.unitsInStore')}</Text>
            <View style={styles.stepperContainer}>
              <TouchableOpacity
                style={styles.stepperBtn}
                onPress={() => adjustStock(item, -1)}
                disabled={item.stock <= 0}
              >
                <Text style={styles.stepperBtnText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.stockCount}>{item.stock}</Text>
              <TouchableOpacity
                style={styles.stepperBtn}
                onPress={() => adjustStock(item, 1)}
              >
                <Text style={styles.stepperBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title={t('common.inventoryManagement')}
        subtitle={t('common.stockLevelsSubtitle')}
      />

      {/* Summary Cards */}
      <View style={styles.summaryBar}>
        <TouchableOpacity
          style={[styles.summaryPill, filter === 'all' && styles.summaryPillActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={styles.summaryPillTitle}>{t('common.all')}</Text>
          <Text style={styles.summaryPillValue}>{products.length}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.summaryPill, filter === 'low' && styles.summaryPillActive]}
          onPress={() => setFilter('low')}
        >
          <Text style={styles.summaryPillTitle}>≤ 5</Text>
          <Text style={styles.summaryPillValue}>{lowStock.length}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.summaryPill, filter === 'out' && styles.summaryPillActive]}
          onPress={() => setFilter('out')}
        >
          <Text style={styles.summaryPillTitle}>{t('home.outOfStock')}</Text>
          <Text style={styles.summaryPillValue}>{outOfStock.length}</Text>
        </TouchableOpacity>
      </View>

      {isLoading && !hasCachedProducts ? (
        <ProductListSkeleton count={4} />
      ) : (
        <FlatList
          data={displayed}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderInventoryItem}
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
              <Text style={styles.emptyText}>{t('orders.empty')}</Text>
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
  summaryBar: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: COLORS.white,
    gap: 8,
  },
  summaryPill: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderColor: COLORS.blue,
    borderWidth: 1.5,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  summaryPillActive: {
    backgroundColor: COLORS.yellow,
    borderColor: COLORS.blue,
    borderWidth: 2,
  },
  summaryPillTitle: {
    fontSize: 11,
    color: COLORS.blue,
    fontWeight: '700',
  },
  summaryPillValue: {
    fontSize: 14,
    color: COLORS.blue,
    fontWeight: '900',
    marginTop: 2,
  },
  listContent: {
    paddingHorizontal: 14,
    paddingBottom: 30,
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderColor: COLORS.blue,
    borderWidth: 2,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  itemCardOut: {
    opacity: 0.7,
  },
  image: {
    width: 75,
    height: 75,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    borderColor: COLORS.blue,
    borderWidth: 1,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  category: {
    fontSize: 10,
    color: COLORS.blue,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  productName: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.blue,
    marginTop: 2,
  },
  price: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.blue,
    marginTop: 2,
  },
  stockControlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  stockLabel: {
    fontSize: 11,
    color: COLORS.blue,
    fontWeight: '700',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: COLORS.blue,
    borderWidth: 1.5,
    borderRadius: 6,
    overflow: 'hidden',
  },
  stepperBtn: {
    backgroundColor: COLORS.yellow,
    width: 28,
    height: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperBtnText: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.blue,
  },
  stockCount: {
    paddingHorizontal: 10,
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.blue,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.blue,
    fontWeight: '700',
  },
});

export default OwnerInventoryScreen;
