import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { queryClient, asyncStoragePersister, setupQueryFocusManager } from './src/api/queryClient';
import COLORS from './src/constants/colors';
import './src/translations/i18n';

// Context Providers
import { AuthProvider } from './src/context/AuthContext';
import { ProductProvider } from './src/context/ProductContext';
import { CartProvider } from './src/context/CartContext';
import { OrderProvider } from './src/context/OrderContext';

// Root Navigation
import RootNavigator from './src/navigation/RootNavigator';

function App(): React.JSX.Element {
  useEffect(() => {
    const cleanupFocus = setupQueryFocusManager();
    return () => {
      cleanupFocus();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{
          persister: asyncStoragePersister,
          maxAge: 1000 * 60 * 60 * 24, // 24 hours
        }}
      >
        <AuthProvider>
          <ProductProvider>
            <CartProvider>
              <OrderProvider>
                <RootNavigator />
              </OrderProvider>
            </CartProvider>
          </ProductProvider>
        </AuthProvider>
      </PersistQueryClientProvider>
    </SafeAreaProvider>
  );
}

export default App;
