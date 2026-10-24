import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import COLORS from '../../constants/colors';
import Header from '../../components/Header';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import { Order } from '../../context/OrderContext';
import { useTranslation } from 'react-i18next';

interface OrderConfirmationScreenProps {
  navigation: any;
  route: any;
}

export const OrderConfirmationScreen: React.FC<OrderConfirmationScreenProps> = ({
  navigation,
  route,
}) => {
  const { order }: { order: Order } = route.params;
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Header title="ORDER CONFIRMATION" subtitle="D&G Rwamagana" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Success Icon */}
        <View style={styles.successIconCircle}>
          <Ionicons name="checkmark" size={40} color={COLORS.blue} />
        </View>

        <Text style={styles.successTitle}>{t('checkout.orderPlaced')}</Text>
        <Text style={styles.successSubtitle}>
          Thank you for shopping at D&G E-Commerce Rwamagana. Your order is received and will be processed shortly.
        </Text>

        {/* Order Details Card */}
        <View style={styles.detailsCard}>
          <View style={styles.orderNumberRow}>
            <Text style={styles.orderNumberLabel}>{t('checkout.orderNumber')}:</Text>
            <Text style={styles.orderNumberValue}>{order.id}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Recipient:</Text>
            <Text style={styles.infoValue}>{order.customerName}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phone:</Text>
            <Text style={styles.infoValue}>{order.customerPhone}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Delivery Location:</Text>
            <Text style={styles.infoValue}>{order.deliveryAddress}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Payment Mode:</Text>
            <Text style={styles.infoValue}>{order.paymentMethod}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Payment Status:</Text>
            <Badge label={order.paymentStatus} variant="yellow" />
          </View>

          <View style={styles.divider} />

          <Text style={styles.itemsTitle}>Ordered Items:</Text>
          {order.items.map((item, idx) => (
            <View key={idx} style={styles.itemRow}>
              <Text style={styles.itemName}>
                {item.quantity}x {item.name}
              </Text>
              <Text style={styles.itemTotal}>
                {(item.price * item.quantity).toLocaleString()} RWF
              </Text>
            </View>
          ))}

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Grand Total:</Text>
            <Text style={styles.totalValue}>{order.total.toLocaleString()} RWF</Text>
          </View>
        </View>

        {/* Action Controls */}
        <View style={styles.actionButtons}>
          <Button
            title={t('checkout.trackOrder')}
            variant="primary"
            size="large"
            onPress={() =>
              navigation.navigate('OrdersTab', {
                screen: 'OrderTracking',
                params: { orderId: order.id },
              })
            }
          />

          <Button
            title={t('checkout.continueShopping')}
            variant="accent"
            size="large"
            onPress={() => navigation.navigate('HomeTab')}
          />
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
    padding: 20,
    alignItems: 'center',
    paddingBottom: 40,
  },
  successIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.yellow,
    borderColor: COLORS.blue,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 14,
  },
  successCheck: {
    fontSize: 40,
    fontWeight: '900',
    color: COLORS.blue,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.blue,
    textAlign: 'center',
    marginBottom: 6,
  },
  successSubtitle: {
    fontSize: 13,
    color: COLORS.blue,
    textAlign: 'center',
    opacity: 0.85,
    marginBottom: 20,
    lineHeight: 18,
  },
  detailsCard: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderColor: COLORS.blue,
    borderWidth: 2.5,
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
  },
  orderNumberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderNumberLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.blue,
  },
  orderNumberValue: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.blue,
  },
  divider: {
    height: 1.5,
    backgroundColor: COLORS.blue,
    marginVertical: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 13,
    color: COLORS.blue,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 13,
    color: COLORS.blue,
    fontWeight: '800',
  },
  itemsTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.blue,
    marginBottom: 6,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  itemName: {
    fontSize: 13,
    color: COLORS.blue,
    flex: 1,
    marginRight: 8,
  },
  itemTotal: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.blue,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1.5,
    borderTopColor: COLORS.blue,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.blue,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.blue,
  },
  actionButtons: {
    width: '100%',
    gap: 12,
  },
});

export default OrderConfirmationScreen;
