import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import COLORS from '../../constants/colors';
import Header from '../../components/Header';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import { useOrders } from '../../context/OrderContext';
import { useOrderMutations } from '../../api/queries';
import { OrderStage } from '../../components/Timeline';

interface OwnerOrderDetailsScreenProps {
  navigation: any;
  route: any;
}

export const OwnerOrderDetailsScreen: React.FC<OwnerOrderDetailsScreenProps> = ({
  navigation,
  route,
}) => {
  const { orderId } = route.params;
  const { getOrderById, updateOrderStatus: updateOrderStatusLocal } = useOrders();
  const { updateOrderStatus: updateOrderStatusMutation } = useOrderMutations();

  const order = getOrderById(orderId);
  const [selectedNewStatus, setSelectedNewStatus] = useState<OrderStage | 'cancelled' | null>(
    null
  );
  const [updating, setUpdating] = useState(false);

  if (!order) {
    return (
      <View style={styles.container}>
        <Header showBack onBack={() => navigation.goBack()} title="ORDER NOT FOUND" />
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
      console.log('Server status update failed, saving locally');
    }
    await updateOrderStatusLocal(order.id, selectedNewStatus);
    setUpdating(false);
    setSelectedNewStatus(null);
  };

  const statusOptions: { key: OrderStage | 'cancelled'; label: string }[] = [
    { key: 'confirmed', label: 'Confirm Order' },
    { key: 'processing', label: 'Mark Processing' },
    { key: 'out_for_delivery', label: 'Out for Delivery' },
    { key: 'delivered', label: 'Mark Delivered' },
    { key: 'cancelled', label: 'Cancel Order' },
  ];

  return (
    <View style={styles.container}>
      <Header
        title={`MANAGE #${order.id}`}
        subtitle="Customer Order Fulfillment"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Status Badge Banner */}
        <View style={styles.statusBanner}>
          <View>
            <Text style={styles.statusBannerTitle}>Current Order State</Text>
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
          <Text style={styles.cardTitle}>Customer Delivery Info</Text>
          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.label}>Recipient Name:</Text>
            <Text style={styles.value}>{order.customerName}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Phone Number:</Text>
            <Text style={styles.value}>{order.customerPhone}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Delivery Address:</Text>
            <Text style={styles.value}>{order.deliveryAddress}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>District:</Text>
            <Text style={styles.value}>{order.district}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Payment Method:</Text>
            <Text style={styles.value}>{order.paymentMethod}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Payment Status:</Text>
            <Badge label={order.paymentStatus} variant="yellow" size="small" />
          </View>
        </View>

        {/* Purchased Items List */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Purchased Items</Text>
          <View style={styles.divider} />

          {order.items.map((item, idx) => (
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
            <Text style={styles.summaryLabel}>Subtotal:</Text>
            <Text style={styles.summaryVal}>{order.subtotal.toLocaleString()} RWF</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery (Rwamagana):</Text>
            <Text style={styles.summaryVal}>
              {order.deliveryFee === 0 ? 'FREE' : `${order.deliveryFee.toLocaleString()} RWF`}
            </Text>
          </View>

          <View style={[styles.summaryRow, styles.grandTotalRow]}>
            <Text style={styles.grandLabel}>Total to Collect:</Text>
            <Text style={styles.grandVal}>{order.total.toLocaleString()} RWF</Text>
          </View>
        </View>

        {/* Permitted Status Transitions */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Transition Status</Text>
          <Text style={styles.cardSub}>
            Update this customer's order stage in the live tracking system:
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
            <Text style={styles.modalTitle}>Confirm Status Change</Text>
            <Text style={styles.modalDesc}>
              Change status of order #{order.id} to "{selectedNewStatus?.toUpperCase()}"?
            </Text>
            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={() => setSelectedNewStatus(null)}
                style={{ flex: 1 }}
              />
              <Button
                title="Update"
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
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  statusBanner: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.blue,
    borderWidth: 2,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusBannerTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.blue,
  },
  statusBannerDate: {
    fontSize: 12,
    color: COLORS.blue,
    opacity: 0.8,
    marginTop: 2,
  },
  card: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.blue,
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.blue,
  },
  cardSub: {
    fontSize: 12,
    color: COLORS.blue,
    opacity: 0.85,
    marginTop: 4,
    marginBottom: 12,
  },
  divider: {
    height: 1.5,
    backgroundColor: COLORS.blue,
    marginVertical: 10,
  },
  row: {
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    color: COLORS.blue,
    fontWeight: '600',
  },
  value: {
    fontSize: 13,
    color: COLORS.blue,
    fontWeight: '800',
    marginTop: 2,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.blue,
  },
  itemQty: {
    fontSize: 11,
    color: COLORS.blue,
    opacity: 0.8,
  },
  itemTotal: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.blue,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
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
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: COLORS.blue,
  },
  grandLabel: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.blue,
  },
  grandVal: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.blue,
  },
  actionsGrid: {
    gap: 8,
  },
  statusActionBtn: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.blue,
    borderWidth: 1.5,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  statusActionBtnCurrent: {
    backgroundColor: COLORS.yellow,
    borderColor: COLORS.blue,
    opacity: 0.7,
  },
  statusActionText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.blue,
  },
  statusActionTextCurrent: {
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
  modalDesc: {
    fontSize: 13,
    color: COLORS.blue,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  emptyContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.blue,
  },
});

export default OwnerOrderDetailsScreen;
