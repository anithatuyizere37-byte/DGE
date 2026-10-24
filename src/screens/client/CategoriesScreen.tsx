import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import COLORS from '../../constants/colors';
import Header from '../../components/Header';
import { useProducts } from '../../context/ProductContext';
import { useCategoriesQuery, useProductsQuery } from '../../api/queries';
import { useCart } from '../../context/CartContext';
import { useTranslation } from 'react-i18next';

interface CategoriesScreenProps {
  navigation: any;
}

const CATEGORY_ICONS: Record<string, string> = {
  Clothes: 'shirt-outline',
  Shoes: 'footsteps-outline',
  Bags: 'bag-handle-outline',
  'Household Equipment': 'home-outline',
  Jewellery: 'diamond-outline',
  Cosmetics: 'sparkles-outline',
};

export const CategoriesScreen: React.FC<CategoriesScreenProps> = ({ navigation }) => {
  const { categories: fallbackCategories, products: fallbackProducts, setSelectedCategory } = useProducts();
  const { data: serverCategories, isRefetching: isCatRefetching, refetch: refetchCats } = useCategoriesQuery();
  const { data: serverProducts, isRefetching: isProdRefetching, refetch: refetchProds } = useProductsQuery();
  const { itemCount } = useCart();
  const { t } = useTranslation();

  const isRefreshing = isCatRefetching || isProdRefetching;
  const categories = serverCategories && serverCategories.length > 0 ? serverCategories : fallbackCategories;
  const products = serverProducts && serverProducts.length > 0 ? serverProducts : fallbackProducts;

  const activeCategories = categories.filter((c) => c !== 'All');

  const handleRefresh = async () => {
    await Promise.all([refetchCats(), refetchProds()]);
  };

  const handleSelectCategory = (cat: string) => {
    setSelectedCategory(cat);
    navigation.navigate('ProductList', { category: cat });
  };

  return (
    <View style={styles.container}>
      <Header
        title={t('nav.categories').toUpperCase()}
        subtitle="D&G Retail Rwamagana"
        cartCount={itemCount}
        onCartPress={() => navigation.navigate('CartTab')}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.blue]}
            tintColor={COLORS.blue}
          />
        }
      >
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>Explore Departments</Text>
          <Text style={styles.bannerSubtitle}>
            Browse our wide retail inventory curated for customers in Rwamagana.
          </Text>
        </View>

        <View style={styles.grid}>
          {activeCategories.map((category) => {
            const count = products.filter((p) => p.category === category).length;
            const iconName = CATEGORY_ICONS[category] || 'cube-outline';

            return (
              <TouchableOpacity
                key={category}
                style={styles.categoryCard}
                activeOpacity={0.8}
                onPress={() => handleSelectCategory(category)}
              >
                <View style={styles.iconCircle}>
                  <Ionicons name={iconName} size={30} color={COLORS.blue} />
                </View>
                <Text style={styles.categoryName}>{category}</Text>
                <View style={styles.countBadge}>
                  <Text style={styles.countText}>{count} Items Available</Text>
                </View>
              </TouchableOpacity>
            );
          })}
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
    paddingBottom: 32,
  },
  banner: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.blue,
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.blue,
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 13,
    color: COLORS.blue,
    opacity: 0.85,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 14,
  },
  categoryCard: {
    width: '47%',
    backgroundColor: COLORS.white,
    borderColor: COLORS.blue,
    borderWidth: 2.5,
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    marginBottom: 10,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.yellow,
    borderColor: COLORS.blue,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  icon: {
    fontSize: 28,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.blue,
    textAlign: 'center',
    marginBottom: 8,
  },
  countBadge: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.blue,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  countText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.blue,
  },
});

export default CategoriesScreen;
