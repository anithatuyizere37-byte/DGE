import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import COLORS from '../../constants/colors';
import Header from '../../components/Header';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import { useOrders } from '../../context/OrderContext';
import { useOrderMutations, useOrderTrackingQuery } from '../../api/queries';
import { OrderStage } from '../../components/Timeline';
import { useTranslation } from 'react-i18next';

interface OwnerOrderDetailsScreenProps {
  navigation: any;
  route: any;
}

export const OwnerOrderDetailsScreen: React.FC<OwnerOrderDetailsScreenProps> = ({
  navigation,
  route,
}) => {
  const { t } = useTranslation();
  const orderId = route.params?.orderId || route.params?.order?.id;
  const passedOrder = route.params?.order;
  const { getOrderById, updateOrderStatus: updateOrderStatusLocal } = useOrders();
  const { updateOrderStatus: updateOrderStatusMutation } = useOrderMutations();

  const { data: serverOrder, isLoading: isQueryLoading } = useOrderTrackingQuery(orderId);
  const localOrder = getOrderById(orderId);
  const order = serverOrder || passedOrder || localOrder;

  const [selectedNewStatus, setSelectedNewStatus] = useState<OrderStage | 'cancelled' | null>(
    null
  );
  const [updating, setUpdating] = useState(false);

  if (isQueryLoading && !order) {
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
        <View style={styles.emptyContent}>
          <Text style={styles.emptyText}>Order record #{orderId} not found.</Text>
        </View>
      </View>
    );
  }

  const handleConfirmStatusChange = async () => {
    if (!selectedNewStatus) return;
    setUpdating(true);
    try {
      await updateOrderStatusMutation.mutateAsync({
        orderId: order.id,
        status: selectedNewStatus,
      });
    } catch (e) {
      console.log('Server status update fallback');
    }
    await updateOrderStatusLocal(order.id, selectedNewStatus);
    setUpdating(false);
    setSelectedNewStatus(null);
  };

  const statusOptions: { key: OrderStage | 'cancelled'; label: string }[] = [
    { key: 'confirmed', label: t('common.confirmOrderBtn') },
    { key: 'processing', label: t('common.markProcessingBtn') },
    { key: 'out_for_delivery', label: t('common.outForDeliveryBtn') },
    { key: 'delivered', label: t('common.markDeliveredBtn') },
    { key: 'cancelled', label: t('common.cancelOrderBtn') },
  ];

  return (
    <View style={styles.container}>
      <Header
        title={`#${order.id}`}
        subtitle={t('common.fulfillmentPipeline')}
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Status Badge Banner */}
        <View style={styles.statusBanner}>
          <View>
            <Text style={styles.statusBannerTitle}>{t('common.orderState')}</Text>
            <Text style={styles.statusBannerDate}>
              Placed: {new Date(order.createdAt).toLocaleString()}
            </Text>
          </View>
          <Badge
            label={order.status.toUpperCase()}
            variant={order.status === 'delivered' ? 'yellow' : 'blue'}
            size="medium"
          />
        </View>

        {/* Customer & Address Details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('common.customerDeliveryInfo')}</Text>
          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.label}>{t('common.recipientName')}</Text>
            <Text style={styles.value}>{order.customerName}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>{t('auth.phoneNumber')}:</Text>
            <Text style={styles.value}>{order.customerPhone}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>{t('checkout.address')}:</Text>
            <Text style={styles.value}>{order.deliveryAddress}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>{t('checkout.district')}:</Text>
            <Text style={styles.value}>{order.district}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>{t('checkout.paymentMethod')}:</Text>
            <Text style={styles.value}>{order.paymentMethod}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>{t('orders.status')}:</Text>
            <Badge label={order.paymentStatus} variant="yellow" size="small" />
          </View>
        </View>

        {/* Purchased Items List */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('common.purchasedItems')}</Text>
          <View style={styles.divider} />

          {(order.items || []).map((item: any, idx: number) => (
            <View key={idx} style={styles.itemRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemQty}>
                  Qty: {item.quantity} x {item.price.toLocaleString()} RWF
                </Text>
              </View>
              <Text style={styles.itemTotal}>
                {(item.price * item.quantity).toLocaleString()} RWF
              </Text>
            </View>
          ))}

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('cart.subtotal')}:</Text>
            <Text style={styles.summaryVal}>{order.subtotal.toLocaleString()} RWF</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('cart.deliveryFee')}:</Text>
            <Text style={styles.summaryVal}>
              {order.deliveryFee === 0 ? 'FREE' : `${order.deliveryFee.toLocaleString()} RWF`}
            </Text>
          </View>

          <View style={[styles.summaryRow, styles.grandTotalRow]}>
            <Text style={styles.grandLabel}>{t('cart.total')}:</Text>
            <Text style={styles.grandVal}>{order.total.toLocaleString()} RWF</Text>
          </View>
        </View>

        {/* Permitted Status Transitions */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('common.changeStatus')}</Text>
          <Text style={styles.cardSub}>
            {t('common.selectNewStatus')}:
          </Text>
          <View style={styles.actionsGrid}>
            {statusOptions.map((opt) => {
              const isCurrent = order.status === opt.key;
              return (
                <TouchableOpacity
                  key={opt.key}
                  disabled={isCurrent}
                  style={[
                    styles.statusActionBtn,
                    isCurrent && styles.statusActionBtnCurrent,
                  ]}
                  onPress={() => setSelectedNewStatus(opt.key)}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                    {isCurrent && <Ionicons name="checkmark" size={14} color={COLORS.blue} style={{ marginRight: 4 }} />}
                    <Text
                      style={[
                        styles.statusActionText,
                        isCurrent && styles.statusActionTextCurrent,
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Confirmation Modal */}
      <Modal
        visible={!!selectedNewStatus}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedNewStatus(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>{t('common.confirm')}</Text>
            <Text style={styles.modalDesc}>
              Change status of order #{order.id} to "{selectedNewStatus?.toUpperCase()}"?
            </Text>
            <View style={styles.modalActions}>
              <Button
                title={t('common.cancel')}
                variant="outline"
                onPress={() => setSelectedNewStatus(null)}
                style={{ flex: 1 }}
              />
              <Button
                title={t('common.confirm')}
                variant="accent"
                loading={updating}
                onPress={handleConfirmStatusChange}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 14,
    paddingBottom: 40,
  },
  emptyContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.blue,
    fontWeight: '700',
  },
  statusBanner: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.blue,
    borderWidth: 2,
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBannerTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.blue,
  },
  statusBannerDate: {
    fontSize: 11,
    color: COLORS.blue,
    opacity: 0.8,
    marginTop: 2,
  },
  card: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.blue,
    borderWidth: 2,
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.blue,
    textTransform: 'uppercase',
  },
  cardSub: {
    fontSize: 11,
    color: COLORS.blue,
    opacity: 0.8,
    marginVertical: 6,
  },
  divider: {
    height: 1.5,
    backgroundColor: COLORS.blue,
    opacity: 0.2,
    marginVertical: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    color: COLORS.blue,
    fontWeight: '600',
  },
  value: {
    fontSize: 12,
    color: COLORS.blue,
    fontWeight: '800',
    maxWidth: '65%',
    textAlign: 'right',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.blue,
  },
  itemQty: {
    fontSize: 11,
    color: COLORS.blue,
    opacity: 0.8,
    marginTop: 2,
  },
  itemTotal: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.blue,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: 12,
    color: COLORS.blue,
    fontWeight: '600',
  },
  summaryVal: {
    fontSize: 12,
    color: COLORS.blue,
    fontWeight: '800',
  },
  grandTotalRow: {
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1.5,
    borderColor: COLORS.blue,
  },
  grandLabel: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.blue,
  },
  grandVal: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.blue,
  },
  actionsGrid: {
    marginTop: 8,
    gap: 8,
  },
  statusActionBtn: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.blue,
    borderWidth: 1.5,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  statusActionBtnCurrent: {
    backgroundColor: COLORS.yellow,
    borderColor: COLORS.blue,
    borderWidth: 2,
  },
  statusActionText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.blue,
  },
  statusActionTextCurrent: {
    fontWeight: '900',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(21, 101, 192, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
  modalDesc: {
    fontSize: 13,
    color: COLORS.blue,
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
  },
});

export default OwnerOrderDetailsScreen;
