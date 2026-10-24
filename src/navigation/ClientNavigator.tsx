import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import COLORS from '../constants/colors';
import { useCart } from '../context/CartContext';

// Client Screens
import HomeScreen from '../screens/client/HomeScreen';
import CategoriesScreen from '../screens/client/CategoriesScreen';
import ProductListScreen from '../screens/client/ProductListScreen';
import ProductDetailsScreen from '../screens/client/ProductDetailsScreen';
import CartScreen from '../screens/client/CartScreen';
import CheckoutScreen from '../screens/client/CheckoutScreen';
import OrderConfirmationScreen from '../screens/client/OrderConfirmationScreen';
import OrderHistoryScreen from '../screens/client/OrderHistoryScreen';
import OrderTrackingScreen from '../screens/client/OrderTrackingScreen';
import ProfileScreen from '../screens/client/ProfileScreen';

// Auth Screens accessible directly from Client flow
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const CategoryStack = createNativeStackNavigator();
const CartStack = createNativeStackNavigator();
const OrdersStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="Home" component={HomeScreen} />
      <HomeStack.Screen name="ProductDetails" component={ProductDetailsScreen} />
      <HomeStack.Screen name="Login" component={LoginScreen} />
      <HomeStack.Screen name="Register" component={RegisterScreen} />
      <HomeStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </HomeStack.Navigator>
  );
}

function CategoryStackNavigator() {
  return (
    <CategoryStack.Navigator screenOptions={{ headerShown: false }}>
      <CategoryStack.Screen name="Categories" component={CategoriesScreen} />
      <CategoryStack.Screen name="ProductList" component={ProductListScreen} />
      <CategoryStack.Screen name="ProductDetails" component={ProductDetailsScreen} />
    </CategoryStack.Navigator>
  );
}

function CartStackNavigator() {
  return (
    <CartStack.Navigator screenOptions={{ headerShown: false }}>
      <CartStack.Screen name="Cart" component={CartScreen} />
      <CartStack.Screen name="Checkout" component={CheckoutScreen} />
      <CartStack.Screen name="OrderConfirmation" component={OrderConfirmationScreen} />
      <CartStack.Screen name="Login" component={LoginScreen} />
    </CartStack.Navigator>
  );
}

function OrdersStackNavigator() {
  return (
    <OrdersStack.Navigator screenOptions={{ headerShown: false }}>
      <OrdersStack.Screen name="OrderHistory" component={OrderHistoryScreen} />
      <OrdersStack.Screen name="OrderTracking" component={OrderTrackingScreen} />
    </OrdersStack.Navigator>
  );
}

function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="Profile" component={ProfileScreen} />
      <ProfileStack.Screen name="Login" component={LoginScreen} />
      <ProfileStack.Screen name="Register" component={RegisterScreen} />
      <ProfileStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </ProfileStack.Navigator>
  );
}

export const ClientNavigator: React.FC = () => {
  const { itemCount } = useCart();

  return (
    <Tab.Navigator
      initialRouteName="HomeTab"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: COLORS.blue,
        tabBarInactiveTintColor: COLORS.blue,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ focused }) => {
          let iconName = 'home-outline';
          if (route.name === 'HomeTab') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'CategoriesTab') iconName = focused ? 'grid' : 'grid-outline';
          else if (route.name === 'CartTab') iconName = focused ? 'cart' : 'cart-outline';
          else if (route.name === 'OrdersTab') iconName = focused ? 'receipt' : 'receipt-outline';
          else if (route.name === 'ProfileTab') iconName = focused ? 'person' : 'person-outline';

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
              {route.name === 'CartTab' && itemCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{itemCount}</Text>
                </View>
              )}
            </View>
          );
        },
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name="CategoriesTab"
        component={CategoryStackNavigator}
        options={{ tabBarLabel: 'Categories' }}
      />
      <Tab.Screen
        name="CartTab"
        component={CartStackNavigator}
        options={{ tabBarLabel: 'Cart' }}
      />
      <Tab.Screen
        name="OrdersTab"
        component={OrdersStackNavigator}
        options={{ tabBarLabel: 'Orders' }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackNavigator}
        options={{ tabBarLabel: 'Profile' }}
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
  badge: {
    position: 'absolute',
    top: -4,
    right: -6,
    backgroundColor: COLORS.yellow,
    borderColor: COLORS.blue,
    borderWidth: 1,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  badgeText: {
    color: COLORS.blue,
    fontSize: 10,
    fontWeight: '900',
  },
});

export default ClientNavigator;
