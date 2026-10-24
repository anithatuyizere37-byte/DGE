import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  RefreshControl,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import COLORS from '../../constants/colors';
import Header from '../../components/Header';
import Badge from '../../components/Badge';
import { HomeScreenSkeleton } from '../../components/Skeleton';
import { useProducts, Product } from '../../context/ProductContext';
import { useProductsQuery } from '../../api/queries';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';

interface HomeScreenProps {
  navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { products: localProducts, categories, searchQuery, setSearchQuery, setSelectedCategory } = useProducts();
  const { data: serverProducts, isLoading, isRefetching, refetch } = useProductsQuery();
  const { addToCart, itemCount } = useCart();
  const { user } = useAuth();
  const { t } = useTranslation();

  const hasCachedProducts = Array.isArray(serverProducts) && serverProducts.length > 0;
  const products: Product[] = hasCachedProducts ? (serverProducts as Product[]) : localProducts;

  const featured = products.filter((p) => p.isFeatured);
  const newArrivals = products.filter((p) => p.isNewArrival);
  const bestSellers = products.filter((p) => p.isBestSeller);

  const handleCategoryPress = (category: string) => {
    setSelectedCategory(category);
    navigation.navigate('CategoriesTab', { screen: 'ProductList', params: { category } });
  };

  const renderProductCard = (product: Product) => {
    const isOutOfStock = product.stock <= 0;

    return (
      <TouchableOpacity
        key={product.id}
        style={styles.productCard}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('ProductDetails', { productId: product.id })}
      >
        <Image source={{ uri: product.imageUrl }} style={styles.productImage} />
        <View style={styles.productBadgeWrapper}>
          <Badge
            label={isOutOfStock ? 'OUT OF STOCK' : product.stock <= 3 ? 'LOW STOCK' : 'IN STOCK'}
            variant={isOutOfStock ? 'outline' : 'yellow'}
          />
        </View>
        <View style={styles.productInfo}>
          <Text style={styles.productCategory}>{product.category}</Text>
          <Text style={styles.productTitle} numberOfLines={1}>
            {product.name}
          </Text>
          <Text style={styles.productPrice}>
            {product.price.toLocaleString()} RWF
          </Text>
          <TouchableOpacity
            style={[styles.addBtn, isOutOfStock && styles.addBtnDisabled]}
            disabled={isOutOfStock}
            onPress={() => addToCart(product, 1)}
          >
            <Text style={styles.addBtnText}>
              {isOutOfStock ? 'UNAVAILABLE' : '+ ADD TO CART'}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title="D&G E-COMMERCE"
        subtitle="Rwamagana, Rwanda"
        cartCount={itemCount}
        onCartPress={() => navigation.navigate('CartTab')}
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
        {isLoading && !hasCachedProducts ? (
          <HomeScreenSkeleton />
        ) : (
          <>
            {/* Greeting Banner */}
            <View style={styles.greetingBar}>
              <Text style={styles.greetingText}>
                Muraho, {user?.fullName || 'Valued Customer'}!
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="location-sharp" size={13} color={COLORS.blue} style={{ marginRight: 3 }} />
                <Text style={styles.shopLocationText}>Rwamagana Retail Shop</Text>
              </View>
            </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={16} color={COLORS.blue} style={{ marginRight: 6 }} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('common.search')}
            placeholderTextColor={COLORS.blue}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={() =>
              navigation.navigate('CategoriesTab', { screen: 'ProductList' })
            }
          />
        </View>

        {/* Promotional Banner (White, Blue, Yellow only) */}
        <View style={styles.promoBanner}>
          <View style={styles.promoTag}>
            <Text style={styles.promoTagText}>SPECIAL OFFER</Text>
          </View>
          <Text style={styles.promoTitle}>{t('home.promoBannerTitle')}</Text>
          <Text style={styles.promoSubtitle}>{t('home.promoBannerSubtitle')}</Text>
          <TouchableOpacity
            style={styles.promoButton}
            onPress={() => handleCategoryPress('Clothes')}
          >
            <Text style={styles.promoButtonText}>EXPLORE RWAMAGANA DEALS ›</Text>
          </TouchableOpacity>
        </View>

        {/* Shop by Category */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('home.shopCategories')}</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
        >
          {categories
            .filter((c) => c !== 'All')
            .map((cat) => (
              <TouchableOpacity
                key={cat}
                style={styles.categoryChip}
                onPress={() => handleCategoryPress(cat)}
              >
                <View style={styles.catDot} />
                <Text style={styles.categoryChipText}>{cat}</Text>
              </TouchableOpacity>
            ))}
        </ScrollView>

        {/* Featured Products */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('home.featuredProducts')}</Text>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('CategoriesTab', { screen: 'ProductList' })
            }
          >
            <Text style={styles.viewAllText}>{t('home.viewAll')} ›</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalProducts}
        >
          {featured.map(renderProductCard)}
        </ScrollView>

        {/* New Arrivals */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('home.newArrivals')}</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalProducts}
        >
          {newArrivals.map(renderProductCard)}
        </ScrollView>

        {/* Best Sellers */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('home.bestSellers')}</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalProducts}
        >
          {bestSellers.map(renderProductCard)}
        </ScrollView>
          </>
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
    paddingBottom: 32,
  },
  greetingBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greetingText: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.blue,
  },
  shopLocationText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.blue,
    backgroundColor: COLORS.yellow,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.blue,
  },
  searchContainer: {
    margin: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderColor: COLORS.blue,
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.blue,
    fontWeight: '600',
  },
  promoBanner: {
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: COLORS.blue,
    borderColor: COLORS.yellow,
    borderWidth: 3,
    borderRadius: 14,
    padding: 18,
  },
  promoTag: {
    backgroundColor: COLORS.yellow,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginBottom: 8,
  },
  promoTagText: {
    color: COLORS.blue,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  promoTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.yellow,
    marginBottom: 4,
  },
  promoSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.white,
    marginBottom: 14,
  },
  promoButton: {
    backgroundColor: COLORS.yellow,
    borderColor: COLORS.white,
    borderWidth: 1.5,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  promoButtonText: {
    color: COLORS.blue,
    fontSize: 12,
    fontWeight: '900',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 10,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: COLORS.blue,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.blue,
    textDecorationLine: 'underline',
  },
  categoryList: {
    paddingHorizontal: 16,
    gap: 8,
    paddingBottom: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderColor: COLORS.blue,
    borderWidth: 2,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginRight: 8,
  },
  catDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.yellow,
    borderWidth: 1,
    borderColor: COLORS.blue,
    marginRight: 6,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.blue,
  },
  horizontalProducts: {
    paddingHorizontal: 16,
    gap: 14,
    paddingBottom: 16,
  },
  productCard: {
    width: 170,
    backgroundColor: COLORS.white,
    borderColor: COLORS.blue,
    borderWidth: 2,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 14,
  },
  productImage: {
    width: '100%',
    height: 130,
    backgroundColor: COLORS.white,
  },
  productBadgeWrapper: {
    position: 'absolute',
    top: 8,
    left: 8,
  },
  productInfo: {
    padding: 10,
  },
  productCategory: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.blue,
    textTransform: 'uppercase',
  },
  productTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.blue,
    marginVertical: 4,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.blue,
    marginBottom: 8,
  },
  addBtn: {
    backgroundColor: COLORS.blue,
    borderColor: COLORS.yellow,
    borderWidth: 1.5,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
  },
  addBtnDisabled: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.blue,
  },
  addBtnText: {
    color: COLORS.yellow,
    fontSize: 11,
    fontWeight: '900',
  },
});

export default HomeScreen;
