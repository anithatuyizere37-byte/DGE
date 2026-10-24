import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, DimensionValue, ViewStyle } from 'react-native';
import COLORS from '../constants/colors';

interface SkeletonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: ViewStyle;
}

/**
 * Atomic Skeleton Box with smooth pulse animation.
 * Strictly uses brand palette: white #FFFFFF with subtle yellow #FFD600 highlight and blue #1565C0 border.
 * Uses a single shared animated value to maintain high 60fps performance and avoid battery drain.
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 16,
  borderRadius = 6,
  style,
}) => {
  const pulseAnim = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.85,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.35,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, [pulseAnim]);

  return (
    <Animated.View
      style={[
        styles.skeletonBox,
        {
          width,
          height,
          borderRadius,
          opacity: pulseAnim,
        },
        style,
      ]}
    />
  );
};

/**
 * Product Card Skeleton (matches Horizontal & Grid product cards)
 */
export const ProductCardSkeleton: React.FC<{ style?: ViewStyle }> = ({ style }) => {
  return (
    <View style={[styles.productCard, style]}>
      {/* Image placeholder */}
      <Skeleton width="100%" height={130} borderRadius={0} />
      <View style={styles.productInfo}>
        {/* Category tag */}
        <Skeleton width="40%" height={10} borderRadius={4} style={{ marginBottom: 6 }} />
        {/* Title */}
        <Skeleton width="90%" height={14} borderRadius={4} style={{ marginBottom: 6 }} />
        {/* Price */}
        <Skeleton width="60%" height={16} borderRadius={4} style={{ marginBottom: 10 }} />
        {/* Button placeholder */}
        <Skeleton width="100%" height={32} borderRadius={6} />
      </View>
    </View>
  );
};

/**
 * Product List Skeleton (vertical catalog feed)
 */
export const ProductListSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <View style={styles.listContainer}>
      {/* Search & filter row placeholder */}
      <View style={styles.filterRow}>
        <Skeleton width="70%" height={42} borderRadius={10} />
        <Skeleton width="25%" height={42} borderRadius={10} />
      </View>
      <View style={styles.gridContainer}>
        {Array.from({ length: count }).map((_, idx) => (
          <ProductCardSkeleton key={idx} style={{ marginBottom: 14 }} />
        ))}
      </View>
    </View>
  );
};

/**
 * Product Details Screen Skeleton
 */
export const ProductDetailsSkeleton: React.FC = () => {
  return (
    <View style={styles.detailsContainer}>
      {/* Large product image */}
      <Skeleton width="100%" height={280} borderRadius={0} />

      <View style={styles.detailsContent}>
        {/* Category & Status badge row */}
        <View style={styles.rowBetween}>
          <Skeleton width="30%" height={14} borderRadius={4} />
          <Skeleton width="25%" height={22} borderRadius={12} />
        </View>

        {/* Title */}
        <Skeleton width="85%" height={24} borderRadius={6} style={{ marginVertical: 10 }} />

        {/* Price Tag */}
        <Skeleton width="45%" height={26} borderRadius={6} style={{ marginBottom: 16 }} />

        {/* Description Header and Lines */}
        <Skeleton width="35%" height={16} borderRadius={4} style={{ marginBottom: 8 }} />
        <Skeleton width="100%" height={12} borderRadius={4} style={{ marginBottom: 6 }} />
        <Skeleton width="95%" height={12} borderRadius={4} style={{ marginBottom: 6 }} />
        <Skeleton width="80%" height={12} borderRadius={4} style={{ marginBottom: 20 }} />

        {/* Stock & Quantity selector row */}
        <View style={styles.rowBetween}>
          <Skeleton width="30%" height={18} borderRadius={4} />
          <Skeleton width="35%" height={40} borderRadius={8} />
        </View>

        {/* Add to cart CTA */}
        <Skeleton width="100%" height={50} borderRadius={10} style={{ marginTop: 24 }} />
      </View>
    </View>
  );
};

/**
 * Order Card Skeleton (for Customer Order History & Seller Orders)
 */
export const OrderCardSkeleton: React.FC = () => {
  return (
    <View style={styles.orderCard}>
      <View style={styles.rowBetween}>
        <Skeleton width="45%" height={16} borderRadius={4} />
        <Skeleton width="25%" height={22} borderRadius={10} />
      </View>
      <Skeleton width="60%" height={12} borderRadius={4} style={{ marginVertical: 8 }} />
      <View style={styles.orderDivider} />
      <View style={styles.rowBetween}>
        <Skeleton width="35%" height={14} borderRadius={4} />
        <Skeleton width="30%" height={18} borderRadius={4} />
      </View>
    </View>
  );
};

/**
 * Dashboard Card Skeleton (for Owner / Seller analytics)
 */
export const DashboardCardSkeleton: React.FC = () => {
  return (
    <View style={styles.dashboardContainer}>
      {/* Store banner placeholder */}
      <Skeleton width="100%" height={56} borderRadius={12} style={{ marginBottom: 14 }} />

      {/* Date filter row */}
      <View style={[styles.rowBetween, { marginBottom: 16 }]}>
        <Skeleton width="31%" height={36} borderRadius={8} />
        <Skeleton width="31%" height={36} borderRadius={8} />
        <Skeleton width="31%" height={36} borderRadius={8} />
      </View>

      {/* Hero Revenue Card */}
      <Skeleton width="100%" height={100} borderRadius={12} style={{ marginBottom: 14 }} />

      {/* 2x2 metric cards */}
      <View style={styles.rowBetween}>
        <Skeleton width="48%" height={85} borderRadius={12} style={{ marginBottom: 12 }} />
        <Skeleton width="48%" height={85} borderRadius={12} style={{ marginBottom: 12 }} />
      </View>
      <View style={styles.rowBetween}>
        <Skeleton width="48%" height={85} borderRadius={12} />
        <Skeleton width="48%" height={85} borderRadius={12} />
      </View>

      {/* Chart placeholder */}
      <Skeleton width="100%" height={180} borderRadius={12} style={{ marginTop: 16 }} />
    </View>
  );
};

/**
 * Home Screen Skeleton
 */
export const HomeScreenSkeleton: React.FC = () => {
  return (
    <View style={styles.homeContainer}>
      {/* Search Bar */}
      <Skeleton width="100%" height={48} borderRadius={12} style={{ marginBottom: 16 }} />

      {/* Promotional Banner */}
      <Skeleton width="100%" height={130} borderRadius={14} style={{ marginBottom: 20 }} />

      {/* Category Pills Header & Horizontal Row */}
      <Skeleton width="40%" height={18} borderRadius={4} style={{ marginBottom: 10 }} />
      <View style={[styles.row, { gap: 10, marginBottom: 20 }]}>
        <Skeleton width={80} height={36} borderRadius={20} />
        <Skeleton width={90} height={36} borderRadius={20} />
        <Skeleton width={85} height={36} borderRadius={20} />
        <Skeleton width={95} height={36} borderRadius={20} />
      </View>

      {/* Section Header */}
      <Skeleton width="45%" height={18} borderRadius={4} style={{ marginBottom: 12 }} />

      {/* Horizontal Product Cards */}
      <View style={[styles.row, { gap: 14 }]}>
        <ProductCardSkeleton style={{ width: 170 }} />
        <ProductCardSkeleton style={{ width: 170 }} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  skeletonBox: {
    backgroundColor: COLORS.yellow,
    borderColor: COLORS.blue,
    borderWidth: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productCard: {
    width: 170,
    backgroundColor: COLORS.white,
    borderColor: COLORS.blue,
    borderWidth: 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  productInfo: {
    padding: 10,
  },
  listContainer: {
    padding: 16,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  detailsContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  detailsContent: {
    padding: 16,
  },
  orderCard: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.blue,
    borderWidth: 2,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  orderDivider: {
    height: 1,
    backgroundColor: COLORS.blue,
    marginVertical: 10,
    opacity: 0.3,
  },
  dashboardContainer: {
    padding: 16,
  },
  homeContainer: {
    padding: 16,
  },
});

export default Skeleton;
