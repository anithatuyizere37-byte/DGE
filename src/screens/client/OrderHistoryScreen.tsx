import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import COLORS from '../../constants/colors';
import Header from '../../components/Header';
import Badge from '../../components/Badge';
import { OrderCardSkeleton } from '../../components/Skeleton';
import { useOrders, Order } from '../../context/OrderContext';
import { useOrdersQuery } from '../../api/queries';
import { useTranslation } from 'react-i18next';

interface OrderHistoryScreenProps {
  navigation: any;
}

export const OrderHistoryScreen: React.FC<OrderHistoryScreenProps> = ({ navigation }) => {
  const { orders: localOrders } = useOrders();
  const { data: serverOrders, isLoading, isRefetching, refetch } = useOrdersQuery();
  const { t } = useTranslation();
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const hasCachedOrders = Array.isArray(serverOrders) && serverOrders.length > 0;
  const orders = hasCachedOrders ? serverOrders : localOrders;

  const filteredOrders = orders.filter((o) => {
    if (filterStatus === 'all') return true;
    return o.status === filterStatus;
  });

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'placed':
        return 'PLACED';
      case 'confirmed':
        return 'CONFIRMED';
      case 'processing':
        return 'PROCESSING';
      case 'out_for_delivery':
        return 'OUT FOR DELIVERY';
      case 'delivered':
        return 'DELIVERED';
      case 'cancelled':
        return 'CANCELLED';
      default:
        return status.toUpperCase();
    }
  };

  const renderOrderItem = ({ item }: { item: Order }) => {
    const totalItems = item.items.reduce((s, i) => s + i.quantity, 0);

    return (
      <View style={styles.orderCard}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.orderId}>{item.id}</Text>
            <Text style={styles.orderDate}>
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>
          <Badge
            label={getStatusLabel(item.status)}
            variant={item.status === 'delivered' ? 'yellow' : 'blue'}
            size="small"
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.cardBody}>
          <Text style={styles.itemsSummary}>
            {totalItems} item(s): {item.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
          </Text>
          <View style={styles.infoRow}>
            <Text style={styles.paymentInfo}>
              Payment: {item.paymentMethod} ({item.paymentStatus})
            </Text>
            <Text style={styles.totalAmount}>
              {item.total.toLocaleString()} RWF
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.trackBtn}
          onPress={() =>
            navigation.navigate('OrderTracking', { orderId: item.id })
          }
        >
          <Text style={styles.trackBtnText}>TRACK ORDER TIMELINE ›</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header title={t('orders.title').toUpperCase()} subtitle="Rwamagana Purchases" />

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {['all', 'processing', 'delivered'].map((st) => (
          <TouchableOpacity
            key={st}
            style={[styles.filterChip, filterStatus === st && styles.filterChipActive]}
            onPress={() => setFilterStatus(st)}
          >
            <Text
              style={[
                styles.filterChipText,
                filterStatus === st && styles.filterChipTextActive,
              ]}
            >
              {st.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading && !hasCachedOrders ? (
        <View style={{ padding: 16 }}>
          <OrderCardSkeleton />
          <OrderCardSkeleton />
          <OrderCardSkeleton />
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.id}
          renderItem={renderOrderItem}
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
              <Ionicons name="receipt-outline" size={48} color={COLORS.blue} style={{ marginBottom: 12 }} />
              <Text style={styles.emptyTitle}>{t('orders.empty')}</Text>
              <Text style={styles.emptySub}>
                You haven't placed any orders matching this filter yet.
              </Text>
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
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1.5,
    borderBottomColor: COLORS.blue,
  },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: COLORS.blue,
    backgroundColor: COLORS.white,
  },
  filterChipActive: {
    backgroundColor: COLORS.yellow,
    borderColor: COLORS.blue,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.blue,
  },
  filterChipTextActive: {
    fontWeight: '900',
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  orderCard: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.blue,
    borderWidth: 2,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderId: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.blue,
  },
  orderDate: {
    fontSize: 12,
    color: COLORS.blue,
    opacity: 0.8,
  },
  divider: {
    height: 1.5,
    backgroundColor: COLORS.blue,
    marginVertical: 10,
  },
  cardBody: {
    marginBottom: 12,
  },
  itemsSummary: {
    fontSize: 13,
    color: COLORS.blue,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentInfo: {
    fontSize: 12,
    color: COLORS.blue,
    fontWeight: '700',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.blue,
  },
  trackBtn: {
    backgroundColor: COLORS.yellow,
    borderColor: COLORS.blue,
    borderWidth: 1.5,
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: 'center',
  },
  trackBtnText: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.blue,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyIcon: {
    fontSize: 44,
    marginBottom: 10,
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
  },
});

export default OrderHistoryScreen;
