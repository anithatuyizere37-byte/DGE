import React from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import COLORS from '../../constants/colors';
import Header from '../../components/Header';
import Timeline from '../../components/Timeline';
import Badge from '../../components/Badge';
import { useOrders, Order } from '../../context/OrderContext';
import { useOrderTrackingQuery } from '../../api/queries';
import { useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '../../api/queryClient';
import { useTranslation } from 'react-i18next';

interface OrderTrackingScreenProps {
  navigation: any;
  route: any;
}

export const OrderTrackingScreen: React.FC<OrderTrackingScreenProps> = ({
  navigation,
  route,
}) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const orderId = route?.params?.orderId || route?.params?.order?.id || '';
  const passedOrder: Order | undefined = route?.params?.order;
  const { getOrderById } = useOrders();

  const cachedOrder = getOrderById(orderId);
  const allCachedOrders = queryClient.getQueryData<Order[]>(QUERY_KEYS.orders);
  const matchedQueryOrder = allCachedOrders?.find((o) => o.id === orderId);

  const isFinalStage =
    (passedOrder?.status === 'delivered' || passedOrder?.status === 'cancelled') ||
    (cachedOrder?.status === 'delivered' || cachedOrder?.status === 'cancelled') ||
    (matchedQueryOrder?.status === 'delivered' || matchedQueryOrder?.status === 'cancelled');

  const { data: serverOrder, isLoading, isRefetching, refetch } = useOrderTrackingQuery(orderId, isFinalStage);

  const order = serverOrder || passedOrder || matchedQueryOrder || cachedOrder;

  if (isLoading && !order) {
    return (
      <View style={styles.container}>
        <Header showBack onBack={() => navigation.goBack()} title={t('common.loading')} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.blue} />
        </View>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.container}>
        <Header showBack onBack={() => navigation.goBack()} title={t('orders.empty')} />
        <View style={styles.notFoundContent}>
          <Text style={styles.notFoundText}>No order record found for #{orderId}</Text>
        </View>
      </View>
    );
  }

  const isCancelled = order.status === 'cancelled';

  return (
    <View style={styles.container}>
      <Header
        title={`#${order.id}`}
        subtitle={t('common.fulfillmentPipeline')}
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
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
      >
        {/* Status Card with 5-Stage Timeline */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{t('orders.tracking')}</Text>
            <Badge
              label={order.status.toUpperCase()}
              variant={order.status === 'delivered' ? 'yellow' : 'blue'}
            />
          </View>
          <Text style={styles.timestampText}>
            Placed on: {new Date(order.createdAt).toLocaleString()}
          </Text>

          <View style={styles.divider} />

          <Timeline
            currentStage={order.status === 'cancelled' ? 'placed' : order.status}
            cancelled={isCancelled}
          />
        </View>

        {/* Delivery Details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('checkout.deliveryInfo')}</Text>
          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('common.recipientName')}</Text>
            <Text style={styles.infoValue}>{order.customerName}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('auth.phoneNumber')}:</Text>
            <Text style={styles.infoValue}>{order.customerPhone}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('checkout.address')}:</Text>
            <Text style={styles.infoValue}>{order.deliveryAddress}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('checkout.district')}:</Text>
            <Text style={styles.infoValue}>{order.district}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('checkout.paymentMethod')}:</Text>
            <Text style={styles.infoValue}>{order.paymentMethod}</Text>
          </View>
        </View>

        {/* Ordered Items Summary */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('common.purchasedItems')}</Text>
          <View style={styles.divider} />

          {order.items.map((item, idx) => (
            <View key={idx} style={styles.itemRow}>
              <Text style={styles.itemName} numberOfLines={1}>
                {item.quantity}x {item.name}
              </Text>
              <Text style={styles.itemPrice}>
                {(item.price * item.quantity).toLocaleString()} RWF
              </Text>
            </View>
          ))}

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>{t('cart.total')}:</Text>
            <Text style={styles.totalValue}>{order.total.toLocaleString()} RWF</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.blue,
    borderWidth: 2,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.blue,
  },
  timestampText: {
    fontSize: 12,
    color: COLORS.blue,
    opacity: 0.8,
    marginTop: 4,
  },
  divider: {
    height: 1.5,
    backgroundColor: COLORS.blue,
    marginVertical: 12,
  },
  infoRow: {
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 12,
    color: COLORS.blue,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 13,
    color: COLORS.blue,
    fontWeight: '800',
    marginTop: 2,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  itemName: {
    fontSize: 13,
    color: COLORS.blue,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  itemPrice: {
    fontSize: 13,
    color: COLORS.blue,
    fontWeight: '900',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderColor: COLORS.blue,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.blue,
  },
  totalValue: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.blue,
  },
  notFoundContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  notFoundText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.blue,
    textAlign: 'center',
  },
});

export default OrderTrackingScreen;
