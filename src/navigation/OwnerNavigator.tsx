import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import COLORS from '../constants/colors';

// Owner Screens
import OwnerDashboardScreen from '../screens/owner/OwnerDashboardScreen';
import OwnerProductsScreen from '../screens/owner/OwnerProductsScreen';
import AddEditProductScreen from '../screens/owner/AddEditProductScreen';
import OwnerInventoryScreen from '../screens/owner/OwnerInventoryScreen';
import OwnerOrdersScreen from '../screens/owner/OwnerOrdersScreen';
import OwnerOrderDetailsScreen from '../screens/owner/OwnerOrderDetailsScreen';
import OwnerReportsScreen from '../screens/owner/OwnerReportsScreen';

const Tab = createBottomTabNavigator();
const ProductsStack = createNativeStackNavigator();
const OrdersStack = createNativeStackNavigator();

function OwnerProductsStackNavigator() {
  return (
    <ProductsStack.Navigator screenOptions={{ headerShown: false }}>
      <ProductsStack.Screen name="OwnerProducts" component={OwnerProductsScreen} />
      <ProductsStack.Screen name="AddEditProduct" component={AddEditProductScreen} />
    </ProductsStack.Navigator>
  );
}

function OwnerOrdersStackNavigator() {
  return (
    <OrdersStack.Navigator screenOptions={{ headerShown: false }}>
      <OrdersStack.Screen name="OwnerOrders" component={OwnerOrdersScreen} />
      <OrdersStack.Screen name="OwnerOrderDetails" component={OwnerOrderDetailsScreen} />
    </OrdersStack.Navigator>
  );
}

export const OwnerNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      initialRouteName="OwnerDashboardTab"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: COLORS.blue,
        tabBarInactiveTintColor: COLORS.blue,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ focused }) => {
          let iconName = 'analytics-outline';
          if (route.name === 'OwnerDashboardTab') iconName = focused ? 'analytics' : 'analytics-outline';
          else if (route.name === 'OwnerProductsTab') iconName = focused ? 'pricetags' : 'pricetags-outline';
          else if (route.name === 'OwnerInventoryTab') iconName = focused ? 'cube' : 'cube-outline';
          else if (route.name === 'OwnerOrdersTab') iconName = focused ? 'receipt' : 'receipt-outline';
          else if (route.name === 'OwnerReportsTab') iconName = focused ? 'trending-up' : 'trending-up-outline';

          return (
            <View
              style={[
                styles.iconWrapper,
                focused && styles.iconWrapperActive,
              ]}
            >
              <Ionicons
                name={iconName}
                size={20}
                color={COLORS.blue}
              />
            </View>
          );
        },
      })}
    >
      <Tab.Screen
        name="OwnerDashboardTab"
        component={OwnerDashboardScreen}
        options={{ tabBarLabel: 'Dashboard' }}
      />
      <Tab.Screen
        name="OwnerProductsTab"
        component={OwnerProductsStackNavigator}
        options={{ tabBarLabel: 'Products' }}
      />
      <Tab.Screen
        name="OwnerInventoryTab"
        component={OwnerInventoryScreen}
        options={{ tabBarLabel: 'Inventory' }}
      />
      <Tab.Screen
        name="OwnerOrdersTab"
        component={OwnerOrdersStackNavigator}
        options={{ tabBarLabel: 'Orders' }}
      />
      <Tab.Screen
        name="OwnerReportsTab"
        component={OwnerReportsScreen}
        options={{ tabBarLabel: 'Reports' }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    height: 64,
    backgroundColor: COLORS.white,
    borderTopWidth: 2,
    borderTopColor: COLORS.blue,
    paddingBottom: 6,
    paddingTop: 6,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.blue,
  },
  iconWrapper: {
    width: 38,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  iconWrapperActive: {
    backgroundColor: COLORS.yellow,
    borderWidth: 1.5,
    borderColor: COLORS.blue,
  },
  tabIcon: {
    fontSize: 16,
  },
});

export default OwnerNavigator;
