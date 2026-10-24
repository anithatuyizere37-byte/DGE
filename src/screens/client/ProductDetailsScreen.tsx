import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import COLORS from '../../constants/colors';
import Header from '../../components/Header';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import { ProductDetailsSkeleton } from '../../components/Skeleton';
import { useProducts } from '../../context/ProductContext';
import { useProductDetailsQuery } from '../../api/queries';
import { useCart } from '../../context/CartContext';
import { useTranslation } from 'react-i18next';

interface ProductDetailsScreenProps {
  navigation: any;
  route: any;
}

export const ProductDetailsScreen: React.FC<ProductDetailsScreenProps> = ({
  navigation,
  route,
}) => {
  const productId = route?.params?.productId || 1;
  const { getProductById, products } = useProducts();
  const { addToCart, itemCount } = useCart();
  const { t } = useTranslation();

  const cachedProduct = getProductById(productId);
  const { data: product, isLoading } = useProductDetailsQuery(productId, cachedProduct);

  const [quantity, setQuantity] = useState(1);
  const [addedBanner, setAddedBanner] = useState(false);

  if (isLoading && !product) {
    return (
      <View style={styles.container}>
        <Header showBack onBack={() => navigation.goBack()} title="LOADING PRODUCT" />
        <ProductDetailsSkeleton />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.notFoundContainer}>
        <Header showBack onBack={() => navigation.goBack()} title="PRODUCT NOT FOUND" />
        <View style={styles.notFoundContent}>
          <Text style={styles.notFoundText}>This product is unavailable or removed.</Text>
          <Button
            title="Back to Catalog"
            onPress={() => navigation.goBack()}
            variant="primary"
          />
        </View>
      </View>
    );
  }

  const isOutOfStock = product.stock <= 0;
  const related = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 3);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAddedBanner(true);
    setTimeout(() => setAddedBanner(false), 2500);
  };

  return (
    <View style={styles.container}>
      <Header
        title={product.category.toUpperCase()}
        subtitle="D&G Rwamagana"
        showBack
        onBack={() => navigation.goBack()}
        cartCount={itemCount}
        onCartPress={() => navigation.navigate('CartTab')}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Main Product Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: product.imageUrl }} style={styles.mainImage} />
          <View style={styles.stockBadgePosition}>
            <Badge
              label={isOutOfStock ? 'OUT OF STOCK' : product.stock <= 3 ? 'LOW STOCK' : 'IN STOCK'}
              variant={isOutOfStock ? 'outline' : 'yellow'}
              size="medium"
            />
          </View>
        </View>

        {/* Product Information Card */}
        <View style={styles.detailsCard}>
          <View style={styles.metaRow}>
            <Text style={styles.categoryText}>{product.category}</Text>
            {product.sku ? <Text style={styles.skuText}>SKU: {product.sku}</Text> : null}
          </View>

          <Text style={styles.productTitle}>{product.name}</Text>
          <Text style={styles.productPrice}>{product.price.toLocaleString()} RWF</Text>

          <View style={styles.stockInfoRow}>
            <Text style={styles.stockInfoLabel}>Stock Availability:</Text>
            <Text style={styles.stockInfoValue}>
              {product.stock > 0 ? `${product.stock} items ready in shop` : 'Sold out'}
            </Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionHeading}>Description</Text>
          <Text style={styles.descriptionText}>{product.description}</Text>

          {/* Delivery Assurance */}
          <View style={styles.assuranceBox}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <Ionicons name="car-outline" size={18} color={COLORS.blue} style={{ marginRight: 6 }} />
              <Text style={styles.assuranceTitle}>Fast Rwamagana Delivery</Text>
            </View>
            <Text style={styles.assuranceDesc}>
              Delivered directly to your door in Rwamagana. Cash on Delivery or Mobile Money accepted.
            </Text>
          </View>

          {/* Success Banner when added */}
          {addedBanner && (
            <View style={styles.addedNotice}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="checkmark-circle" size={16} color={COLORS.blue} style={{ marginRight: 6 }} />
                <Text style={styles.addedNoticeText}>
                  Added {quantity} item(s) to your cart!
                </Text>
              </View>
            </View>
          )}

          {/* Quantity Controls & Add to Cart */}
          <View style={styles.purchaseControls}>
            <View style={styles.quantityPicker}>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={isOutOfStock}
              >
                <Text style={styles.qtyBtnText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.qtyDisplay}>{quantity}</Text>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => setQuantity(Math.min(product.stock, quantity + 1))}
                disabled={isOutOfStock || quantity >= product.stock}
              >
                <Text style={styles.qtyBtnText}>+</Text>
              </TouchableOpacity>
            </View>

            <Button
              title={isOutOfStock ? 'OUT OF STOCK' : `ADD TO CART • ${(product.price * quantity).toLocaleString()} RWF`}
              variant={isOutOfStock ? 'outline' : 'primary'}
              disabled={isOutOfStock}
              onPress={handleAddToCart}
              style={styles.addToCartBtn}
            />
          </View>
        </View>

        {/* Related Products */}
        {related.length > 0 && (
          <View style={styles.relatedSection}>
            <Text style={styles.relatedHeading}>Related in {product.category}</Text>
            <View style={styles.relatedList}>
              {related.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.relatedCard}
                  onPress={() => navigation.push('ProductDetails', { productId: item.id })}
                >
                  <Image source={{ uri: item.imageUrl }} style={styles.relatedImage} />
                  <Text style={styles.relatedTitle} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.relatedPrice}>{item.price.toLocaleString()} RWF</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
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
    paddingBottom: 40,
  },
  imageContainer: {
    width: '100%',
    height: 280,
    backgroundColor: COLORS.white,
    position: 'relative',
    borderBottomWidth: 2,
    borderBottomColor: COLORS.blue,
  },
  mainImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  stockBadgePosition: {
    position: 'absolute',
    top: 14,
    left: 14,
  },
  detailsCard: {
    padding: 20,
    backgroundColor: COLORS.white,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.blue,
    textTransform: 'uppercase',
  },
  skuText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.blue,
    opacity: 0.8,
  },
  productTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.blue,
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.blue,
    marginBottom: 12,
  },
  stockInfoRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  stockInfoLabel: {
    fontSize: 13,
    color: COLORS.blue,
    fontWeight: '600',
  },
  stockInfoValue: {
    fontSize: 13,
    color: COLORS.blue,
    fontWeight: '800',
  },
  divider: {
    height: 1.5,
    backgroundColor: COLORS.blue,
    marginVertical: 14,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.blue,
    marginBottom: 6,
  },
  descriptionText: {
    fontSize: 14,
    color: COLORS.blue,
    lineHeight: 22,
    marginBottom: 16,
  },
  assuranceBox: {
    backgroundColor: COLORS.yellow,
    borderColor: COLORS.blue,
    borderWidth: 2,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  assuranceTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.blue,
    marginBottom: 2,
  },
  assuranceDesc: {
    fontSize: 12,
    color: COLORS.blue,
    fontWeight: '600',
  },
  addedNotice: {
    backgroundColor: COLORS.yellow,
    borderColor: COLORS.blue,
    borderWidth: 2,
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    alignItems: 'center',
  },
  addedNoticeText: {
    color: COLORS.blue,
    fontWeight: '900',
    fontSize: 13,
  },
  purchaseControls: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  quantityPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: COLORS.blue,
    borderWidth: 2,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    height: 50,
  },
  qtyBtn: {
    width: 40,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnText: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.blue,
  },
  qtyDisplay: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.blue,
    paddingHorizontal: 12,
  },
  addToCartBtn: {
    flex: 1,
  },
  relatedSection: {
    padding: 20,
    borderTopWidth: 2,
    borderTopColor: COLORS.blue,
  },
  relatedHeading: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.blue,
    marginBottom: 12,
  },
  relatedList: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  relatedCard: {
    width: '31%',
    backgroundColor: COLORS.white,
    borderColor: COLORS.blue,
    borderWidth: 1.5,
    borderRadius: 8,
    overflow: 'hidden',
  },
  relatedImage: {
    width: '100%',
    height: 80,
    backgroundColor: COLORS.white,
  },
  relatedTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.blue,
    padding: 4,
  },
  relatedPrice: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.blue,
    paddingHorizontal: 4,
    paddingBottom: 4,
  },
  notFoundContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
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
    marginBottom: 16,
    fontWeight: '700',
  },
});

export default ProductDetailsScreen;
