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

export const OwnerInventoryScreen: React.FC = () => {
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
    updateStock.mutate({ id: product.id, stock: newStock });
    updateProductLocal(product.id, { stock: newStock });
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
              label={isOut ? 'OUT OF STOCK' : isLow ? 'LOW STOCK' : 'IN STOCK'}
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
            <Text style={styles.stockLabel}>Units in Store:</Text>
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
      <Header title="INVENTORY MANAGEMENT" subtitle="Stock Levels in Rwamagana" />

      {/* Summary Cards */}
      <View style={styles.summaryBar}>
        <TouchableOpacity
          style={[styles.summaryPill, filter === 'all' && styles.summaryPillActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={styles.summaryPillTitle}>Total Catalog</Text>
          <Text style={styles.summaryPillValue}>{products.length}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.summaryPill, filter === 'low' && styles.summaryPillActive]}
          onPress={() => setFilter('low')}
        >
          <Text style={styles.summaryPillTitle}>Low Stock (≤5)</Text>
          <Text style={styles.summaryPillValue}>{lowStock.length}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.summaryPill, filter === 'out' && styles.summaryPillActive]}
          onPress={() => setFilter('out')}
        >
          <Text style={styles.summaryPillTitle}>Out of Stock</Text>
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
              <Text style={styles.emptyText}>No items matching selected inventory filter.</Text>
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
    padding: 12,
    gap: 8,
    borderBottomWidth: 1.5,
    borderBottomColor: COLORS.blue,
  },
  summaryPill: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderColor: COLORS.blue,
    borderWidth: 1.5,
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
  },
  summaryPillActive: {
    backgroundColor: COLORS.yellow,
    borderColor: COLORS.blue,
    borderWidth: 2,
  },
  summaryPillTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.blue,
    textTransform: 'uppercase',
  },
  summaryPillValue: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.blue,
    marginTop: 2,
  },
  listContent: {
    padding: 14,
    paddingBottom: 30,
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderColor: COLORS.blue,
    borderWidth: 2,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  itemCardOut: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.blue,
  },
  image: {
    width: 80,
    height: 80,
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
    fontWeight: '800',
    color: COLORS.blue,
    textTransform: 'uppercase',
  },
  productName: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.blue,
    marginVertical: 2,
  },
  price: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.blue,
  },
  stockControlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  stockLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.blue,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.blue,
    borderRadius: 6,
    backgroundColor: COLORS.white,
  },
  stepperBtn: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  stepperBtnText: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.blue,
  },
  stockCount: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.blue,
    paddingHorizontal: 6,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.blue,
    fontWeight: '700',
  },
});

export default OwnerInventoryScreen;
