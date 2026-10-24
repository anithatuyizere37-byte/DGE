import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  Modal,
  RefreshControl,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import COLORS from '../../constants/colors';
import Header from '../../components/Header';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import { useProducts, Product } from '../../context/ProductContext';
import { useSellerInventoryQuery, useProductMutations } from '../../api/queries';
import { useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '../../api/queryClient';
import { useTranslation } from 'react-i18next';

interface OwnerProductsScreenProps {
  navigation: any;
}

export const OwnerProductsScreen: React.FC<OwnerProductsScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { products: localProducts, deleteProduct: deleteProductLocal } = useProducts();
  const { data: serverProducts, isRefetching, refetch } = useSellerInventoryQuery();
  const { deleteProduct: deleteMutation } = useProductMutations();
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const products = Array.isArray(serverProducts) && serverProducts.length > 0 ? serverProducts : localProducts;

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()))
  );

  const confirmDelete = async () => {
    if (deleteTarget) {
      const targetId = deleteTarget.id;
      // Optimistic instant UI update
      queryClient.setQueryData<Product[]>(QUERY_KEYS.sellerInventory, (old) =>
        old ? old.filter((p) => p.id !== targetId) : []
      );
      queryClient.setQueryData<Product[]>(QUERY_KEYS.products, (old) =>
        old ? old.filter((p) => p.id !== targetId) : []
      );
      await deleteProductLocal(targetId);
      setDeleteTarget(null);
      try {
        await deleteMutation.mutateAsync(targetId);
      } catch (e) {
        console.log('Delete fallback to local state');
      }
    }
  };

  const renderProductItem = ({ item }: { item: Product }) => {
    const isOutOfStock = item.stock <= 0;

    return (
      <View style={styles.card}>
        <Image source={{ uri: item.imageUrl }} style={styles.image} />
        <View style={styles.info}>
          <View style={styles.categoryRow}>
            <Text style={styles.category}>{item.category}</Text>
            <Badge
              label={isOutOfStock ? t('home.outOfStock').toUpperCase() : item.stock <= 5 ? t('common.stockWarnings').toUpperCase() : t('home.inStock').toUpperCase()}
              variant={isOutOfStock ? 'outline' : 'yellow'}
              size="small"
            />
          </View>

          <Text style={styles.title} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.price}>{item.price.toLocaleString()} RWF</Text>
          <Text style={styles.stock}>{t('common.unitsInStore')} {item.stock} {t('common.units')}</Text>

          {/* Action Buttons */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() =>
                navigation.navigate('AddEditProduct', { product: item })
              }
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="pencil" size={12} color={COLORS.blue} style={{ marginRight: 4 }} />
                <Text style={styles.editBtnText}>{t('common.edit').toUpperCase()}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => setDeleteTarget(item)}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="trash-outline" size={12} color={COLORS.blue} style={{ marginRight: 4 }} />
                <Text style={styles.deleteBtnText}>{t('common.delete').toUpperCase()}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title={t('common.inventoryCatalog')}
        subtitle={t('common.manageCatalog')}
        rightAction={
          <TouchableOpacity
            style={styles.addHeaderBtn}
            onPress={() => navigation.navigate('AddEditProduct')}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="add" size={16} color={COLORS.blue} style={{ marginRight: 2 }} />
              <Text style={styles.addHeaderText}>{t('common.save') === 'Bika' ? 'ONGERA' : t('common.save') === 'Enregistrer' ? 'AJOUTER' : 'ADD'}</Text>
            </View>
          </TouchableOpacity>
        }
      />

      {/* Search Header */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={16} color={COLORS.blue} style={{ marginRight: 6 }} />
        <TextInput
          style={styles.searchInput}
          placeholder={t('common.searchPlaceholderCatalog')}
          placeholderTextColor={COLORS.blue}
          value={search}
          onChangeText={setSearch}
        />
        {search ? (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={COLORS.blue} />
          </TouchableOpacity>
        ) : null}
      </View>

      <FlatList
        data={filtered}
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
            <Text style={styles.emptyTitle}>{t('orders.empty')}</Text>
          </View>
        }
      />

      {/* Delete Confirmation Modal (Strictly White, Blue, Yellow) */}
      <Modal
        visible={!!deleteTarget}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteTarget(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>{t('common.deleteConfirmTitle')}</Text>
            <Text style={styles.modalText}>
              {t('common.deleteConfirmText')} ({deleteTarget?.name})
            </Text>
            <View style={styles.modalButtons}>
              <Button
                title={t('common.cancel')}
                variant="outline"
                onPress={() => setDeleteTarget(null)}
                style={{ flex: 1 }}
              />
              <Button
                title={t('common.delete')}
                variant="accent"
                onPress={confirmDelete}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  addHeaderBtn: {
    backgroundColor: COLORS.yellow,
    borderColor: COLORS.blue,
    borderWidth: 1.5,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  addHeaderText: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.blue,
  },
  searchBar: {
    margin: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderColor: COLORS.blue,
    borderWidth: 2,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    color: COLORS.blue,
    fontSize: 13,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 14,
    paddingBottom: 30,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderColor: COLORS.blue,
    borderWidth: 2,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderColor: COLORS.blue,
    borderWidth: 1,
    backgroundColor: COLORS.white,
  },
  info: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  categoryRow: {
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
  title: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.blue,
    marginTop: 2,
  },
  price: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.blue,
    marginTop: 2,
  },
  stock: {
    fontSize: 11,
    color: COLORS.blue,
    fontWeight: '600',
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  editBtn: {
    backgroundColor: COLORS.yellow,
    borderColor: COLORS.blue,
    borderWidth: 1.5,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  editBtnText: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.blue,
  },
  deleteBtn: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.blue,
    borderWidth: 1.5,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  deleteBtnText: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.blue,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 14,
    color: COLORS.blue,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(21, 101, 192, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalBox: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.blue,
    borderWidth: 2,
    borderRadius: 14,
    padding: 20,
    width: '100%',
    maxWidth: 340,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.blue,
    marginBottom: 8,
  },
  modalText: {
    fontSize: 13,
    color: COLORS.blue,
    lineHeight: 18,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
});

export default OwnerProductsScreen;
