import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Modal,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import COLORS from '../../constants/colors';
import Header from '../../components/Header';
import Button from '../../components/Button';
import { useCart, CartItem } from '../../context/CartContext';
import { useTranslation } from 'react-i18next';

interface CartScreenProps {
  navigation: any;
}

export const CartScreen: React.FC<CartScreenProps> = ({ navigation }) => {
  const {
    items,
    subtotal,
    deliveryFee,
    discount,
    total,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();
  const { t } = useTranslation();

  const [confirmClearVisible, setConfirmClearVisible] = useState(false);

  const renderCartItem = ({ item }: { item: CartItem }) => {
    const itemSubtotal = item.price * item.quantity;

    return (
      <View style={styles.itemCard}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
        ) : (
          <View style={[styles.itemImage, styles.noImage]}>
            <Text style={styles.noImageText}>D&G</Text>
          </View>
        )}

        <View style={styles.itemDetails}>
          <View style={styles.titleRow}>
            <Text style={styles.itemName} numberOfLines={1}>
              {item.name}
            </Text>
            <TouchableOpacity
              onPress={() => removeFromCart(item.id)}
              style={styles.removeBtn}
            >
              <Ionicons name="close" size={16} color={COLORS.blue} />
            </TouchableOpacity>
          </View>

          <Text style={styles.itemUnitPrice}>
            {item.price.toLocaleString()} RWF / unit
          </Text>

          <View style={styles.bottomRow}>
            {/* Quantity Selector */}
            <View style={styles.qtyContainer}>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => updateQuantity(item.id, item.quantity - 1)}
              >
                <Text style={styles.qtyBtnText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.qtyValue}>{item.quantity}</Text>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => updateQuantity(item.id, item.quantity + 1)}
                disabled={item.quantity >= item.stock}
              >
                <Text style={styles.qtyBtnText}>+</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.itemSubtotal}>
              {itemSubtotal.toLocaleString()} RWF
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title={t('cart.title').toUpperCase()}
        subtitle={`${items.length} items`}
      />

      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyCircle}>
            <Ionicons name="cart-outline" size={42} color={COLORS.blue} />
          </View>
          <Text style={styles.emptyTitle}>{t('cart.empty')}</Text>
          <Text style={styles.emptySubtitle}>
            Add quality clothes, shoes, bags, household equipment and more from our Rwamagana shop!
          </Text>
          <Button
            title={t('cart.startShopping')}
            variant="accent"
            size="large"
            onPress={() => navigation.navigate('HomeTab')}
            style={styles.startShopBtn}
          />
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <FlatList
            data={items}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderCartItem}
            contentContainerStyle={styles.listContent}
            ListHeaderComponent={
              <View style={styles.headerActionRow}>
                <TouchableOpacity
                  onPress={() => navigation.navigate('HomeTab')}
                >
                  <Text style={styles.continueShopText}>
                    ‹ Continue Shopping
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setConfirmClearVisible(true)}>
                  <Text style={styles.clearCartText}>Clear Cart</Text>
                </TouchableOpacity>
              </View>
            }
          />

          {/* Checkout & Totals Summary Footer */}
          <View style={styles.summaryFooter}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{t('cart.subtotal')}</Text>
              <Text style={styles.summaryValue}>
                {subtotal.toLocaleString()} RWF
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{t('cart.deliveryFee')}</Text>
              <Text style={styles.summaryValue}>
                {deliveryFee === 0 ? 'FREE (Rwamagana)' : `${deliveryFee.toLocaleString()} RWF`}
              </Text>
            </View>

            {discount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{t('cart.discount')}</Text>
                <Text style={styles.summaryValue}>
                  -{discount.toLocaleString()} RWF
                </Text>
              </View>
            )}

            <View style={styles.divider} />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>{t('cart.total')}</Text>
              <Text style={styles.totalValue}>
                {total.toLocaleString()} RWF
              </Text>
            </View>

            <Button
              title={`${t('cart.checkout')} • ${total.toLocaleString()} RWF`}
              variant="primary"
              size="large"
              onPress={() => navigation.navigate('Checkout')}
              style={styles.checkoutBtn}
            />
          </View>
        </View>
      )}

      {/* Clear Cart Confirmation Modal (Strictly White, Blue, Yellow) */}
      <Modal
        visible={confirmClearVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmClearVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Clear Shopping Cart?</Text>
            <Text style={styles.modalMessage}>{t('cart.clearConfirm')}</Text>
            <View style={styles.modalActions}>
              <Button
                title={t('common.cancel')}
                variant="outline"
                onPress={() => setConfirmClearVisible(false)}
                style={{ flex: 1 }}
              />
              <Button
                title={t('common.confirm')}
                variant="accent"
                onPress={() => {
                  clearCart();
                  setConfirmClearVisible(false);
                }}
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
  listContent: {
    padding: 16,
    paddingBottom: 20,
  },
  headerActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  continueShopText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.blue,
    textDecorationLine: 'underline',
  },
  clearCartText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.blue,
    textDecorationLine: 'underline',
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderColor: COLORS.blue,
    borderWidth: 2,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    borderColor: COLORS.blue,
    borderWidth: 1,
  },
  noImage: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.yellow,
  },
  noImageText: {
    fontWeight: '900',
    color: COLORS.blue,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemName: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.blue,
    flex: 1,
    marginRight: 6,
  },
  removeBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.yellow,
    borderColor: COLORS.blue,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtnText: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.blue,
  },
  itemUnitPrice: {
    fontSize: 12,
    color: COLORS.blue,
    opacity: 0.85,
    marginVertical: 4,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.blue,
    borderRadius: 6,
    backgroundColor: COLORS.white,
  },
  qtyBtn: {
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  qtyBtnText: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.blue,
  },
  qtyValue: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.blue,
    paddingHorizontal: 8,
  },
  itemSubtotal: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.blue,
  },
  summaryFooter: {
    backgroundColor: COLORS.white,
    borderTopWidth: 2,
    borderTopColor: COLORS.blue,
    padding: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: 13,
    color: COLORS.blue,
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: 13,
    color: COLORS.blue,
    fontWeight: '800',
  },
  divider: {
    height: 1.5,
    backgroundColor: COLORS.blue,
    marginVertical: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.blue,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.blue,
  },
  checkoutBtn: {
    width: '100%',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: COLORS.yellow,
    borderColor: COLORS.blue,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyIcon: {
    fontSize: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.blue,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.blue,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
  },
  startShopBtn: {
    paddingHorizontal: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(21, 101, 192, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
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
  modalMessage: {
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
});

export default CartScreen;
