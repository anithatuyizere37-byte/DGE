import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import COLORS from '../../constants/colors';
import Header from '../../components/Header';
import Badge from '../../components/Badge';
import { OrderCardSkeleton } from '../../components/Skeleton';
import { useOrders, Order } from '../../context/OrderContext';
import { useOrdersQuery } from '../../api/queries';
import { useTranslation } from 'react-i18next';

interface OwnerOrdersScreenProps {
  navigation: any;
}

export const OwnerOrdersScreen: React.FC<OwnerOrdersScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const { orders: localOrders } = useOrders();
  const { data: serverOrders, isLoading, isRefetching, refetch } = useOrdersQuery();
  const [activeTab, setActiveTab] = useState<string>('all');

  const hasCachedOrders = Array.isArray(serverOrders) && serverOrders.length > 0;
  const orders = hasCachedOrders ? serverOrders : localOrders;

  const filteredOrders = orders.filter((o) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return o.status === 'placed' || o.status === 'processing';
    if (activeTab === 'delivered') return o.status === 'delivered';
    return o.status === activeTab;
  });

  const renderOrderItem = ({ item }: { item: Order }) => {
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() =>
          navigation.navigate('OwnerOrderDetails', { orderId: item.id, order: item })
        }
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.orderId}>{item.id}</Text>
            <Text style={styles.customerName}>{item.customerName}</Text>
          </View>
          <Badge
            label={item.status.toUpperCase()}
            variant={item.status === 'delivered' ? 'yellow' : 'blue'}
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.metaRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="calendar-outline" size={13} color={COLORS.blue} style={{ marginRight: 4 }} />
            <Text style={styles.metaText}>
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="location-outline" size={13} color={COLORS.blue} style={{ marginRight: 4 }} />
            <Text style={styles.metaText}>
              {item.district}
            </Text>
          </View>
        </View>

        <View style={styles.footerRow}>
          <View>
            <Text style={styles.paymentStatus}>
              {item.paymentMethod} • {item.paymentStatus}
            </Text>
            <Text style={styles.itemsCount}>
              {item.items.reduce((s, i) => s + i.quantity, 0)} item(s)
            </Text>
          </View>
          <Text style={styles.total}>{item.total.toLocaleString()} RWF</Text>
        </View>

        <View style={styles.viewDetailsBtn}>
          <Text style={styles.viewDetailsText}>{t('common.viewDetails').toUpperCase()} ›</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title={t('common.ordersManagement')}
        subtitle={t('common.fulfillmentPipeline')}
      />

      {/* Status Filter Tabs */}
      <View style={styles.tabsRow}>
        {[
          { key: 'all', label: t('common.all') },
          { key: 'pending', label: t('owner.pendingOrders') },
          { key: 'delivered', label: t('owner.deliveredOrders') },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab.key && styles.tabTextActive,
              ]}
            >
              {tab.label}
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
              <Text style={styles.emptyTitle}>No orders in this status</Text>
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
  tabsRow: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
    borderBottomWidth: 1.5,
    borderBottomColor: COLORS.blue,
  },
  tab: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderColor: COLORS.blue,
    borderWidth: 1.5,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: COLORS.yellow,
    borderColor: COLORS.blue,
    borderWidth: 2,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.blue,
  },
  tabTextActive: {
    fontWeight: '900',
  },
  listContent: {
    padding: 16,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.blue,
    borderWidth: 2,
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderId: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.blue,
  },
  customerName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.blue,
    marginTop: 2,
  },
  divider: {
    height: 1.5,
    backgroundColor: COLORS.blue,
    marginVertical: 10,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metaText: {
    fontSize: 11,
    color: COLORS.blue,
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  paymentStatus: {
    fontSize: 12,
    color: COLORS.blue,
    fontWeight: '700',
  },
  itemsCount: {
    fontSize: 11,
    color: COLORS.blue,
    opacity: 0.8,
  },
  total: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.blue,
  },
  viewDetailsBtn: {
    backgroundColor: COLORS.yellow,
    borderColor: COLORS.blue,
    borderWidth: 1.5,
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: 'center',
  },
  viewDetailsText: {
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
});

export default OwnerOrdersScreen;
