import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import SplashScreen from '../screens/auth/SplashScreen';
import AuthNavigator from './AuthNavigator';
import ClientNavigator from './ClientNavigator';
import OwnerNavigator from './OwnerNavigator';

export const RootNavigator: React.FC = () => {
  const { isLoading, isAuthenticated, isOwner } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  if (isLoading || showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <NavigationContainer>
      {isOwner ? (
        <OwnerNavigator />
      ) : (
        <ClientNavigator />
      )}
    </NavigationContainer>
  );
};

export default RootNavigator;
