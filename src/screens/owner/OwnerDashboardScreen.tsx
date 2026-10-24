import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import COLORS from '../../constants/colors';
import Header from '../../components/Header';
import Badge from '../../components/Badge';
import BarChart from '../../components/Chart';
import { DashboardCardSkeleton } from '../../components/Skeleton';
import { useProducts } from '../../context/ProductContext';
import { useOrders } from '../../context/OrderContext';
import { useAuth } from '../../context/AuthContext';
import { useSellerInventoryQuery, useOrdersQuery } from '../../api/queries';
import { useTranslation } from 'react-i18next';

interface OwnerDashboardScreenProps {
  navigation: any;
}

export const OwnerDashboardScreen: React.FC<OwnerDashboardScreenProps> = ({
  navigation,
}) => {
  const { t } = useTranslation();
  const { products: localProducts } = useProducts();
  const { orders: localOrders } = useOrders();
  const { logout } = useAuth();

  const {
    data: serverProducts,
    isLoading: isProductsLoading,
    isRefetching: isProductsRefetching,
    refetch: refetchProducts,
  } = useSellerInventoryQuery();

  const {
    data: serverOrders,
    isLoading: isOrdersLoading,
    isRefetching: isOrdersRefetching,
    refetch: refetchOrders,
  } = useOrdersQuery();

  const hasCachedProducts = Array.isArray(serverProducts) && serverProducts.length > 0;
  const hasCachedOrders = Array.isArray(serverOrders) && serverOrders.length > 0;
  const products = hasCachedProducts ? serverProducts : localProducts;
  const orders = hasCachedOrders ? serverOrders : localOrders;
  const isRefreshing = isProductsRefetching || isOrdersRefetching;
  const isInitialLoading =
    (isProductsLoading && !hasCachedProducts) ||
    (isOrdersLoading && !hasCachedOrders);

  const handleRefresh = async () => {
    await Promise.all([refetchProducts(), refetchOrders()]);
  };

  const [dateFilter, setDateFilter] = useState<'today' | '7days' | '30days'>('7days');

  // Compute live shop metrics
  const totalSales = orders.reduce((sum, o) => sum + o.total, 0);
  const totalOrdersCount = orders.length;
  const pendingOrders = orders.filter(
    (o) => o.status === 'placed' || o.status === 'processing'
  ).length;
  const deliveredOrders = orders.filter((o) => o.status === 'delivered').length;
  const lowStockProducts = products.filter((p) => p.stock > 0 && p.stock <= 5);
  const outOfStockProducts = products.filter((p) => p.stock === 0);

  // Weekly sales trend chart data
  const chartData = [
    { label: 'Mon', value: 85000 },
    { label: 'Tue', value: 120000 },
    { label: 'Wed', value: 95000 },
    { label: 'Thu', value: 160000 },
    { label: 'Fri', value: 210000 },
    { label: 'Sat', value: 340000 },
    { label: 'Sun', value: 190000 },
  ];

  return (
    <View style={styles.container}>
      <Header
        title={t('owner.dashboardTitle').toUpperCase()}
        subtitle={t('common.singleStoreOps')}
        rightAction={
          <TouchableOpacity
            style={styles.headerLogoutBtn}
            onPress={logout}
          >
            <Text style={styles.headerLogoutText}>{t('auth.logout')}</Text>
          </TouchableOpacity>
        }
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
        {isInitialLoading ? (
          <DashboardCardSkeleton />
        ) : (
          <>
            {/* Welcome & Shop Status Header */}
            <View style={styles.storeStatusBanner}>
              <View>
                <Text style={styles.storeStatusTitle}>{t('common.singleStoreOps')}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                  <Ionicons name="location-sharp" size={13} color={COLORS.blue} style={{ marginRight: 3 }} />
                  <Text style={styles.storeStatusLocation}>{t('common.location')}</Text>
                </View>
              </View>
              <View style={styles.storeBadge}>
                <Text style={styles.storeBadgeText}>{t('common.shopOpen')}</Text>
              </View>
            </View>

        {/* Date Filter Tabs */}
        <View style={styles.filterTabsRow}>
          {(['today', '7days', '30days'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.filterTab,
                dateFilter === tab && styles.filterTabActive,
              ]}
              onPress={() => setDateFilter(tab)}
            >
              <Text
                style={[
                  styles.filterTabText,
                  dateFilter === tab && styles.filterTabTextActive,
                ]}
              >
                {tab === 'today' ? t('common.today') : tab === '7days' ? t('common.last7Days') : t('common.last30Days')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Management Actions (CRUD Shortcuts) */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.quickActionsTitle}>{t('common.managementActionsTitle')}</Text>
          <View style={styles.quickActionsRow}>
            <TouchableOpacity
              style={styles.quickActionBtn}
              onPress={() =>
                navigation.navigate('OwnerProductsTab', {
                  screen: 'AddEditProduct',
                })
              }
            >
              <View style={styles.quickActionIconWrap}>
                <Ionicons name="add-circle" size={24} color={COLORS.blue} />
              </View>
              <Text style={styles.quickActionLabel}>{t('owner.addProduct')}</Text>
              <Text style={styles.quickActionSub}>Create new</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionBtn}
              onPress={() =>
                navigation.navigate('OwnerProductsTab', {
                  screen: 'OwnerProducts',
                })
              }
            >
              <View style={styles.quickActionIconWrap}>
                <Ionicons name="pricetags" size={22} color={COLORS.blue} />
              </View>
              <Text style={styles.quickActionLabel}>{t('common.editCatalog')}</Text>
              <Text style={styles.quickActionSub}>Update & delete</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionBtn}
              onPress={() => navigation.navigate('OwnerInventoryTab')}
            >
              <View style={styles.quickActionIconWrap}>
                <Ionicons name="cube" size={22} color={COLORS.blue} />
              </View>
              <Text style={styles.quickActionLabel}>{t('common.adjustStock')}</Text>
              <Text style={styles.quickActionSub}>Quick ± inventory</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionBtn}
              onPress={() => navigation.navigate('OwnerOrdersTab')}
            >
              <View style={styles.quickActionIconWrap}>
                <Ionicons name="receipt" size={22} color={COLORS.blue} />
              </View>
              <Text style={styles.quickActionLabel}>{t('common.updateOrders')}</Text>
              <Text style={styles.quickActionSub}>Delivery stages</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* KPI Metric Cards Grid */}
        <View style={styles.metricsGrid}>
          {/* Total Revenue */}
          <View style={styles.primaryMetricCard}>
            <Text style={styles.primaryMetricLabel}>{t('owner.totalSales')}</Text>
            <Text style={styles.primaryMetricValue}>
              {totalSales.toLocaleString()} RWF
            </Text>
            <Text style={styles.metricSubtext}>Across all settled orders</Text>
          </View>

          {/* Orders Breakdown */}
          <View style={styles.metricHalfCard}>
            <Text style={styles.metricLabel}>{t('owner.totalOrders')}</Text>
            <Text style={styles.metricValue}>{totalOrdersCount}</Text>
            <Text style={styles.metricSubtext}>{deliveredOrders} fulfilled</Text>
          </View>

          <View style={styles.metricHalfCard}>
            <Text style={styles.metricLabel}>{t('owner.pendingOrders')}</Text>
            <Text style={[styles.metricValue, { color: COLORS.blue }]}>
              {pendingOrders}
            </Text>
            <Text style={styles.metricSubtext}>Awaiting delivery</Text>
          </View>

          {/* Inventory Health */}
          <View style={styles.metricHalfCard}>
            <Text style={styles.metricLabel}>{t('nav.products')}</Text>
            <Text style={styles.metricValue}>{products.length}</Text>
            <Text style={styles.metricSubtext}>6 Active categories</Text>
          </View>

          <View style={[styles.metricHalfCard, styles.alertHalfCard]}>
            <Text style={styles.alertMetricLabel}>{t('common.stockWarnings')}</Text>
            <Text style={styles.alertMetricValue}>
              {lowStockProducts.length + outOfStockProducts.length}
            </Text>
            <Text style={styles.alertMetricSubtext}>
              {outOfStockProducts.length} {t('home.outOfStock')}
            </Text>
          </View>
        </View>

        {/* Sales Trend Chart */}
        <BarChart
          data={chartData}
          title="Weekly Revenue Trend (RWF) • Rwamagana Store"
        />

        {/* Low Stock Alerts Action Box */}
        {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
          <View style={styles.alertBox}>
            <View style={styles.alertHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="alert-circle" size={16} color={COLORS.blue} style={{ marginRight: 6 }} />
                <Text style={styles.alertTitle}>{t('common.immediateRestock')}</Text>
              </View>
              <TouchableOpacity
                onPress={() => navigation.navigate('OwnerInventoryTab')}
              >
                <Text style={styles.alertAction}>{t('common.manageStock')}</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.alertDesc}>
              {lowStockProducts.map((p) => `${p.name} (${p.stock} left)`).join(' • ')}
              {outOfStockProducts.length > 0
                ? ` • ${outOfStockProducts.map((p) => `${p.name} (OUT)`).join(' • ')}`
                : ''}
            </Text>
          </View>
        )}

        {/* Recent Orders Overview */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('common.recentOrdersTitle')}</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('OwnerOrdersTab')}
            >
              <Text style={styles.sectionLink}>{t('common.viewAllOrders')}</Text>
            </TouchableOpacity>
          </View>

          {orders.slice(0, 3).map((ord) => (
            <TouchableOpacity
              key={ord.id}
              style={styles.recentOrderRow}
              onPress={() =>
                navigation.navigate('OwnerOrdersTab', {
                  screen: 'OwnerOrderDetails',
                  params: { orderId: ord.id, order: ord },
                })
              }
            >
              <View>
                <Text style={styles.recentOrderId}>{ord.id}</Text>
                <Text style={styles.recentOrderCustomer}>{ord.customerName}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.recentOrderTotal}>
                  {ord.total.toLocaleString()} RWF
                </Text>
                <Badge
                  label={ord.status.toUpperCase()}
                  variant={ord.status === 'delivered' ? 'yellow' : 'blue'}
                  size="small"
                />
              </View>
            </TouchableOpacity>
          ))}
        </View>
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
    padding: 16,
    paddingBottom: 40,
  },
  headerLogoutBtn: {
    backgroundColor: COLORS.yellow,
    borderColor: COLORS.blue,
    borderWidth: 1.5,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  headerLogoutText: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.blue,
  },
  storeStatusBanner: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.blue,
    borderWidth: 2,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  storeStatusTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.blue,
  },
  storeStatusLocation: {
    fontSize: 12,
    color: COLORS.blue,
    opacity: 0.85,
    marginTop: 2,
  },
  quickActionsContainer: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.blue,
    borderWidth: 2,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  quickActionsTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.blue,
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  quickActionBtn: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderColor: COLORS.blue,
    borderWidth: 1.5,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.yellow,
    borderColor: COLORS.blue,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  quickActionLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.blue,
    textAlign: 'center',
  },
  quickActionSub: {
    fontSize: 9,
    fontWeight: '600',
    color: COLORS.blue,
    opacity: 0.8,
    textAlign: 'center',
    marginTop: 2,
  },
  storeBadge: {
    backgroundColor: COLORS.yellow,
    borderColor: COLORS.blue,
    borderWidth: 1.5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  storeBadgeText: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.blue,
  },
  filterTabsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterTab: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderColor: COLORS.blue,
    borderWidth: 1.5,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  filterTabActive: {
    backgroundColor: COLORS.yellow,
    borderColor: COLORS.blue,
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.blue,
  },
  filterTabTextActive: {
    fontWeight: '900',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  primaryMetricCard: {
    width: '100%',
    backgroundColor: COLORS.blue,
    borderColor: COLORS.yellow,
    borderWidth: 3,
    borderRadius: 12,
    padding: 18,
  },
  primaryMetricLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.yellow,
    textTransform: 'uppercase',
  },
  primaryMetricValue: {
    fontSize: 26,
    fontWeight: '900',
    color: COLORS.white,
    marginVertical: 4,
  },
  metricHalfCard: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderColor: COLORS.blue,
    borderWidth: 2,
    borderRadius: 12,
    padding: 14,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.blue,
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.blue,
    marginVertical: 4,
  },
  metricSubtext: {
    fontSize: 11,
    color: COLORS.blue,
    opacity: 0.8,
  },
  alertHalfCard: {
    backgroundColor: COLORS.yellow,
    borderColor: COLORS.blue,
  },
  alertMetricLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.blue,
  },
  alertMetricValue: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.blue,
    marginVertical: 4,
  },
  alertMetricSubtext: {
    fontSize: 11,
    color: COLORS.blue,
    fontWeight: '700',
  },
  alertBox: {
    backgroundColor: COLORS.yellow,
    borderColor: COLORS.blue,
    borderWidth: 2,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.blue,
  },
  alertAction: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.blue,
    textDecorationLine: 'underline',
  },
  alertDesc: {
    fontSize: 12,
    color: COLORS.blue,
    lineHeight: 18,
    fontWeight: '600',
  },
  sectionCard: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.blue,
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.blue,
  },
  sectionLink: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.blue,
    textDecorationLine: 'underline',
  },
  recentOrderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.blue,
  },
  recentOrderId: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.blue,
  },
  recentOrderCustomer: {
    fontSize: 12,
    color: COLORS.blue,
    opacity: 0.8,
  },
  recentOrderTotal: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.blue,
    marginBottom: 2,
  },
});

export default OwnerDashboardScreen;
