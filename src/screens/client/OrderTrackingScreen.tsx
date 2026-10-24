import React from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import COLORS from '../../constants/colors';
import Header from '../../components/Header';
import Timeline from '../../components/Timeline';
import Badge from '../../components/Badge';
import { useOrders } from '../../context/OrderContext';
import { useOrderTrackingQuery } from '../../api/queries';
import { useTranslation } from 'react-i18next';

interface OrderTrackingScreenProps {
  navigation: any;
  route: any;
}

export const OrderTrackingScreen: React.FC<OrderTrackingScreenProps> = ({
  navigation,
  route,
}) => {
  const orderId = route?.params?.orderId || '';
  const { getOrderById } = useOrders();
  const { t } = useTranslation();

  const cachedOrder = getOrderById(orderId);
  const isFinalStage = cachedOrder?.status === 'delivered' || cachedOrder?.status === 'cancelled';
  const { data: serverOrder, isRefetching, refetch } = useOrderTrackingQuery(orderId, isFinalStage);

  const order = serverOrder || cachedOrder;

  if (!order) {
    return (
      <View style={styles.container}>
        <Header showBack onBack={() => navigation.goBack()} title="TRACKING NOT FOUND" />
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
        title={`TRACKING #${order.id}`}
        subtitle="Rwamagana Shop Dispatch"
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
            <Text style={styles.cardTitle}>Fulfillment Timeline</Text>
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
          <Text style={styles.cardTitle}>Delivery Information</Text>
          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Recipient Name:</Text>
            <Text style={styles.infoValue}>{order.customerName}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Contact Number:</Text>
            <Text style={styles.infoValue}>{order.customerPhone}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Delivery Address:</Text>
            <Text style={styles.infoValue}>{order.deliveryAddress}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>District:</Text>
            <Text style={styles.infoValue}>{order.district}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Payment Mode:</Text>
            <Text style={styles.infoValue}>{order.paymentMethod}</Text>
          </View>
        </View>

        {/* Ordered Items Summary */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Ordered Items</Text>
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
            <Text style={styles.totalLabel}>Total Amount:</Text>
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
    flex: 1,
    marginRight: 8,
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.blue,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1.5,
    borderTopColor: COLORS.blue,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.blue,
  },
  totalValue: {
    fontSize: 17,
    fontWeight: '900',
    color: COLORS.blue,
  },
  notFoundContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  notFoundText: {
    fontSize: 16,
    color: COLORS.blue,
    fontWeight: '700',
  },
});

export default OrderTrackingScreen;
