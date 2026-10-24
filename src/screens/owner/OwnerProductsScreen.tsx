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

interface OwnerProductsScreenProps {
  navigation: any;
}

export const OwnerProductsScreen: React.FC<OwnerProductsScreenProps> = ({ navigation }) => {
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
      try {
        await deleteMutation.mutateAsync(deleteTarget.id);
      } catch (e) {
        console.log('Delete fallback to local state');
      }
      await deleteProductLocal(deleteTarget.id);
      setDeleteTarget(null);
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
              label={isOutOfStock ? 'OUT OF STOCK' : item.stock <= 5 ? 'LOW STOCK' : 'IN STOCK'}
              variant={isOutOfStock ? 'outline' : 'yellow'}
              size="small"
            />
          </View>

          <Text style={styles.title} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.price}>{item.price.toLocaleString()} RWF</Text>
          <Text style={styles.stock}>Inventory: {item.stock} units</Text>

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
                <Text style={styles.editBtnText}>EDIT</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => setDeleteTarget(item)}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="trash-outline" size={12} color={COLORS.blue} style={{ marginRight: 4 }} />
                <Text style={styles.deleteBtnText}>DELETE</Text>
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
        title="PRODUCT CATALOG"
        subtitle="Manage Shop Items"
        rightAction={
          <TouchableOpacity
            style={styles.addHeaderBtn}
            onPress={() => navigation.navigate('AddEditProduct')}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="add" size={16} color={COLORS.blue} style={{ marginRight: 2 }} />
              <Text style={styles.addHeaderText}>ADD</Text>
            </View>
          </TouchableOpacity>
        }
      />

      {/* Search Header */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={16} color={COLORS.blue} style={{ marginRight: 6 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, category, or SKU..."
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
            <Text style={styles.emptyTitle}>No matching products</Text>
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
            <Text style={styles.modalTitle}>Delete Product?</Text>
            <Text style={styles.modalText}>
              Are you sure you want to remove "{deleteTarget?.name}" from D&G Rwamagana catalog?
            </Text>
            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={() => setDeleteTarget(null)}
                style={{ flex: 1 }}
              />
              <Button
                title="Delete"
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
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: COLORS.blue,
    fontSize: 13,
    fontWeight: '600',
  },
  clearSearch: {
    fontSize: 14,
    color: COLORS.blue,
    fontWeight: '900',
    padding: 4,
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
    width: 90,
    height: 100,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    borderColor: COLORS.blue,
    borderWidth: 1,
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
    fontWeight: '800',
    color: COLORS.blue,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.blue,
    marginVertical: 2,
  },
  price: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.blue,
  },
  stock: {
    fontSize: 11,
    color: COLORS.blue,
    opacity: 0.85,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  editBtn: {
    backgroundColor: COLORS.yellow,
    borderColor: COLORS.blue,
    borderWidth: 1.5,
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  editBtnText: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.blue,
  },
  deleteBtn: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.blue,
    borderWidth: 1.5,
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  deleteBtnText: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.blue,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.blue,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(21, 101, 192, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalBox: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderColor: COLORS.blue,
    borderWidth: 3,
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.blue,
    marginBottom: 8,
  },
  modalText: {
    fontSize: 13,
    color: COLORS.blue,
    textAlign: 'center',
    marginBottom: 18,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
});

export default OwnerProductsScreen;
