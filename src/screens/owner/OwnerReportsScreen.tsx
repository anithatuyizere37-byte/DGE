import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import COLORS from '../../constants/colors';
import Header from '../../components/Header';
import BarChart from '../../components/Chart';
import { DashboardCardSkeleton } from '../../components/Skeleton';
import { useProducts } from '../../context/ProductContext';
import { useOrders } from '../../context/OrderContext';
import { useSellerSalesQuery } from '../../api/queries';

export const OwnerReportsScreen: React.FC = () => {
  const { products } = useProducts();
  const { orders } = useOrders();
  const { data: salesReportData, isRefetching, refetch } = useSellerSalesQuery('30days');
  const [reportType, setReportType] = useState<'sales' | 'products' | 'orders' | 'customers'>(
    'sales'
  );

  const totalSales = orders.reduce((sum, o) => sum + o.total, 0);
  const avgOrderValue = orders.length > 0 ? Math.round(totalSales / orders.length) : 0;
  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= 5).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;

  const salesTrend = [
    { label: 'May', value: 850000 },
    { label: 'Jun', value: 1200000 },
    { label: 'Jul', value: 950000 },
    { label: 'Aug', value: 1450000 },
    { label: 'Sep', value: 1800000 },
    { label: 'Oct', value: 2150000 },
  ];

  return (
    <View style={styles.container}>
      <Header title="REPORTS & ANALYTICS" subtitle="D&G Rwamagana Performance" />

      {/* Report Switcher Tabs */}
      <View style={styles.tabsRow}>
        {(
          [
            { key: 'sales', label: 'Sales' },
            { key: 'products', label: 'Products' },
            { key: 'orders', label: 'Orders' },
            { key: 'customers', label: 'Customers' },
          ] as const
        ).map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, reportType === tab.key && styles.tabActive]}
            onPress={() => setReportType(tab.key)}
          >
            <Text
              style={[
                styles.tabText,
                reportType === tab.key && styles.tabTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

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
        {reportType === 'sales' && (
          <View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Cumulative Revenue</Text>
              <Text style={styles.kpiValue}>{totalSales.toLocaleString()} RWF</Text>
              <Text style={styles.kpiSub}>From {orders.length} completed transactions</Text>
            </View>

            <View style={styles.metricsRow}>
              <View style={styles.halfCard}>
                <Text style={styles.halfLabel}>Average Order</Text>
                <Text style={styles.halfValue}>{avgOrderValue.toLocaleString()} RWF</Text>
              </View>
              <View style={styles.halfCard}>
                <Text style={styles.halfLabel}>Monthly Target</Text>
                <Text style={styles.halfValue}>3.5M RWF</Text>
              </View>
            </View>

            <BarChart data={salesTrend} title="6-Month Sales Growth (RWF)" />
          </View>
        )}

        {reportType === 'products' && (
          <View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Total Catalog SKUs</Text>
              <Text style={styles.kpiValue}>{products.length} Products</Text>
              <Text style={styles.kpiSub}>6 Active Retail Departments</Text>
            </View>

            <View style={styles.metricsRow}>
              <View style={styles.halfCard}>
                <Text style={styles.halfLabel}>Low Stock Items</Text>
                <Text style={styles.halfValue}>{lowStockCount}</Text>
              </View>
              <View style={[styles.halfCard, { backgroundColor: COLORS.yellow }]}>
                <Text style={styles.halfLabel}>Out of Stock</Text>
                <Text style={styles.halfValue}>{outOfStockCount}</Text>
              </View>
            </View>

            <View style={styles.tableCard}>
              <Text style={styles.tableTitle}>Top Selling Items in Rwamagana</Text>
              <View style={styles.divider} />
              {products
                .filter((p) => p.isBestSeller)
                .map((p) => (
                  <View key={p.id} style={styles.tableRow}>
                    <Text style={styles.tableItemName} numberOfLines={1}>
                      {p.name}
                    </Text>
                    <Text style={styles.tableItemVal}>
                      {p.price.toLocaleString()} RWF
                    </Text>
                  </View>
                ))}
            </View>
          </View>
        )}

        {reportType === 'orders' && (
          <View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Total Orders Logged</Text>
              <Text style={styles.kpiValue}>{orders.length} Orders</Text>
            </View>

            <View style={styles.tableCard}>
              <Text style={styles.tableTitle}>Orders By Status</Text>
              <View style={styles.divider} />
              <View style={styles.tableRow}>
                <Text style={styles.tableItemName}>Placed / Processing</Text>
                <Text style={styles.tableItemVal}>
                  {orders.filter((o) => o.status === 'placed' || o.status === 'processing').length}
                </Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableItemName}>Delivered</Text>
                <Text style={styles.tableItemVal}>
                  {orders.filter((o) => o.status === 'delivered').length}
                </Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableItemName}>Cancelled</Text>
                <Text style={styles.tableItemVal}>
                  {orders.filter((o) => o.status === 'cancelled').length}
                </Text>
              </View>
            </View>
          </View>
        )}

        {reportType === 'customers' && (
          <View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Registered Client Accounts</Text>
              <Text style={styles.kpiValue}>2 Active Clients</Text>
              <Text style={styles.kpiSub}>100% Rwamagana area delivery addresses</Text>
            </View>

            <View style={styles.tableCard}>
              <Text style={styles.tableTitle}>Top Purchasing Clients</Text>
              <View style={styles.divider} />
              <View style={styles.tableRow}>
                <Text style={styles.tableItemName}>Jean Claude Uwase</Text>
                <Text style={styles.tableItemVal}>36,000 RWF (1 Order)</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableItemName}>Aline Mukamana</Text>
                <Text style={styles.tableItemVal}>45,000 RWF (1 Order)</Text>
              </View>
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
  tabsRow: {
    flexDirection: 'row',
    padding: 10,
    gap: 6,
    borderBottomWidth: 1.5,
    borderBottomColor: COLORS.blue,
  },
  tab: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderColor: COLORS.blue,
    borderWidth: 1.5,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: COLORS.yellow,
    borderColor: COLORS.blue,
    borderWidth: 2,
  },
  tabText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.blue,
  },
  tabTextActive: {
    fontWeight: '900',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  kpiCard: {
    backgroundColor: COLORS.blue,
    borderColor: COLORS.yellow,
    borderWidth: 2.5,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  kpiLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.yellow,
    textTransform: 'uppercase',
  },
  kpiValue: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.white,
    marginVertical: 4,
  },
  kpiSub: {
    fontSize: 12,
    color: COLORS.white,
    opacity: 0.9,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  halfCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderColor: COLORS.blue,
    borderWidth: 2,
    borderRadius: 10,
    padding: 12,
  },
  halfLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.blue,
  },
  halfValue: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.blue,
    marginTop: 4,
  },
  tableCard: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.blue,
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
  },
  tableTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.blue,
  },
  divider: {
    height: 1.5,
    backgroundColor: COLORS.blue,
    marginVertical: 10,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  tableItemName: {
    fontSize: 13,
    color: COLORS.blue,
    fontWeight: '600',
    flex: 1,
  },
  tableItemVal: {
    fontSize: 13,
    color: COLORS.blue,
    fontWeight: '800',
  },
});

export default OwnerReportsScreen;
