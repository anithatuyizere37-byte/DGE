import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import COLORS from '../../constants/colors';
import Header from '../../components/Header';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { useCart } from '../../context/CartContext';
import { useOrders } from '../../context/OrderContext';
import { useOrderMutations } from '../../api/queries';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';

interface CheckoutScreenProps {
  navigation: any;
}

export const CheckoutScreen: React.FC<CheckoutScreenProps> = ({ navigation }) => {
  const { items, subtotal, deliveryFee, total, clearCart } = useCart();
  const { createOrder: createOrderLocal } = useOrders();
  const { createOrder: createOrderMutation } = useOrderMutations();
  const isSubmitting = createOrderMutation.isPending;
  const { user } = useAuth();
  const { t } = useTranslation();

  const [customerName, setCustomerName] = useState(user?.fullName || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phoneNumber || '');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [district, setDistrict] = useState('Rwamagana');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Cash on Delivery' | 'Mobile Money'>(
    'Cash on Delivery'
  );
  const [validationError, setValidationError] = useState('');

  const handlePlaceOrder = async () => {
    setValidationError('');

    if (!customerName.trim()) {
      setValidationError('Please provide the recipient name');
      return;
    }
    if (!customerPhone.trim()) {
      setValidationError('Please provide a contact phone number in Rwanda');
      return;
    }
    if (!deliveryAddress.trim()) {
      setValidationError('Please provide the delivery street address or landmark');
      return;
    }

    try {
      const orderPayload = {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        deliveryAddress: `${deliveryAddress.trim()} (${deliveryNotes.trim() || 'No notes'})`,
        district: district.trim(),
        paymentMethod,
        paymentStatus: 'Pending',
        items: items.map((i) => ({
          productId: i.id,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          imageUrl: i.imageUrl,
        })),
        subtotal,
        deliveryFee,
        total,
      };

      // Try server mutation first; falls back to local creation seamlessly
      let newOrder;
      try {
        newOrder = await createOrderMutation.mutateAsync(orderPayload);
      } catch (err) {
        newOrder = await createOrderLocal(orderPayload as any);
      }

      clearCart();
      navigation.navigate('OrderConfirmation', { order: newOrder });
    } catch (e: any) {
      setValidationError('Failed to submit order. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        <Header
          title={t('checkout.title').toUpperCase()}
          subtitle="Rwamagana Fast Delivery"
          showBack
          onBack={() => navigation.goBack()}
        />

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Step 1: Delivery Information */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.stepCircle}>
                <Text style={styles.stepNum}>1</Text>
              </View>
              <Text style={styles.sectionTitle}>{t('checkout.deliveryInfo')}</Text>
            </View>

            <Input
              label="Recipient Full Name"
              placeholder="e.g. Emmanuel Habimana"
              value={customerName}
              onChangeText={setCustomerName}
            />

            <Input
              label="Contact Phone Number"
              placeholder="e.g. +250 788 123 456"
              value={customerPhone}
              onChangeText={setCustomerPhone}
              keyboardType="phone-pad"
            />

            <Input
              label="District / Sector in Rwanda"
              placeholder="e.g. Rwamagana, Kigabiro"
              value={district}
              onChangeText={setDistrict}
            />

            <Input
              label={t('checkout.address')}
              placeholder="e.g. Near Rwamagana Market / Main Hospital"
              value={deliveryAddress}
              onChangeText={setDeliveryAddress}
            />

            <Input
              label="Delivery Instructions / Landmark (Optional)"
              placeholder="e.g. Blue gate next to the bakery"
              value={deliveryNotes}
              onChangeText={setDeliveryNotes}
            />
          </View>

          {/* Step 2: Payment Method */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.stepCircle}>
                <Text style={styles.stepNum}>2</Text>
              </View>
              <Text style={styles.sectionTitle}>{t('checkout.paymentMethod')}</Text>
            </View>

            <TouchableOpacity
              style={[
                styles.paymentOption,
                paymentMethod === 'Cash on Delivery' && styles.paymentOptionActive,
              ]}
              onPress={() => setPaymentMethod('Cash on Delivery')}
            >
              <View
                style={[
                  styles.radioCircle,
                  paymentMethod === 'Cash on Delivery' && styles.radioCircleActive,
                ]}
              >
                {paymentMethod === 'Cash on Delivery' && (
                  <View style={styles.radioDot} />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.paymentName}>Cash on Delivery</Text>
                <Text style={styles.paymentDesc}>
                  Pay cash directly to the courier upon receiving your package in Rwamagana.
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.paymentOption,
                paymentMethod === 'Mobile Money' && styles.paymentOptionActive,
              ]}
              onPress={() => setPaymentMethod('Mobile Money')}
            >
              <View
                style={[
                  styles.radioCircle,
                  paymentMethod === 'Mobile Money' && styles.radioCircleActive,
                ]}
              >
                {paymentMethod === 'Mobile Money' && (
                  <View style={styles.radioDot} />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.paymentName}>Mobile Money (MTN / Airtel)</Text>
                <Text style={styles.paymentDesc}>
                  Direct MoMo payment to shop merchant code on order confirmation.
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Step 3: Order Review */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.stepCircle}>
                <Text style={styles.stepNum}>3</Text>
              </View>
              <Text style={styles.sectionTitle}>{t('checkout.orderSummary')}</Text>
            </View>

            {items.map((item) => (
              <View key={item.id} style={styles.reviewItemRow}>
                <Text style={styles.reviewItemName} numberOfLines={1}>
                  {item.quantity}x {item.name}
                </Text>
                <Text style={styles.reviewItemPrice}>
                  {(item.price * item.quantity).toLocaleString()} RWF
                </Text>
              </View>
            ))}

            <View style={styles.divider} />

            <View style={styles.reviewTotalRow}>
              <Text style={styles.reviewTotalLabel}>Subtotal</Text>
              <Text style={styles.reviewTotalValue}>
                {subtotal.toLocaleString()} RWF
              </Text>
            </View>

            <View style={styles.reviewTotalRow}>
              <Text style={styles.reviewTotalLabel}>Delivery (Rwamagana)</Text>
              <Text style={styles.reviewTotalValue}>
                {deliveryFee === 0 ? 'FREE' : `${deliveryFee.toLocaleString()} RWF`}
              </Text>
            </View>

            <View style={[styles.reviewTotalRow, styles.grandTotalRow]}>
              <Text style={styles.grandTotalLabel}>TOTAL TO PAY</Text>
              <Text style={styles.grandTotalValue}>
                {total.toLocaleString()} RWF
              </Text>
            </View>
          </View>

          {validationError ? (
            <View style={styles.alertBox}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="alert-circle" size={16} color={COLORS.blue} style={{ marginRight: 6 }} />
                <Text style={styles.alertText}>{validationError}</Text>
              </View>
            </View>
          ) : null}

          {/* Submit Action */}
          <Button
            title={`${t('checkout.placeOrder')} • ${total.toLocaleString()} RWF`}
            variant="primary"
            size="large"
            loading={isSubmitting}
            onPress={handlePlaceOrder}
            style={styles.submitBtn}
          />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
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
  sectionCard: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.blue,
    borderWidth: 2,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.yellow,
    borderColor: COLORS.blue,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  stepNum: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.blue,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.blue,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.white,
    borderColor: COLORS.blue,
    borderWidth: 1.5,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  paymentOptionActive: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.yellow,
    borderWidth: 2.5,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.blue,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  radioCircleActive: {
    borderColor: COLORS.blue,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.yellow,
    borderWidth: 1,
    borderColor: COLORS.blue,
  },
  paymentName: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.blue,
    marginBottom: 2,
  },
  paymentDesc: {
    fontSize: 12,
    color: COLORS.blue,
    opacity: 0.85,
  },
  reviewItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  reviewItemName: {
    fontSize: 13,
    color: COLORS.blue,
    flex: 1,
    marginRight: 8,
  },
  reviewItemPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.blue,
  },
  divider: {
    height: 1.5,
    backgroundColor: COLORS.blue,
    marginVertical: 10,
  },
  reviewTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  reviewTotalLabel: {
    fontSize: 13,
    color: COLORS.blue,
    fontWeight: '600',
  },
  reviewTotalValue: {
    fontSize: 13,
    color: COLORS.blue,
    fontWeight: '800',
  },
  grandTotalRow: {
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: COLORS.blue,
  },
  grandTotalLabel: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.blue,
  },
  grandTotalValue: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.blue,
  },
  alertBox: {
    backgroundColor: COLORS.yellow,
    borderColor: COLORS.blue,
    borderWidth: 2,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  alertText: {
    color: COLORS.blue,
    fontWeight: '800',
    fontSize: 13,
  },
  submitBtn: {
    width: '100%',
  },
});

export default CheckoutScreen;
