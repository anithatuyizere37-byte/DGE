import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image } from 'react-native';
import COLORS from '../../constants/colors';

const LOGO_IMG = require('../../assets/logo.png');

interface SplashScreenProps {
  onFinish?: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onFinish) onFinish();
    }, 1800);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <View style={styles.container}>
      <View style={styles.logoCard}>
        <Image
          source={LOGO_IMG}
          style={styles.logoImage}
          resizeMode="contain"
          accessibilityLabel="D&G E-Commerce Logo"
        />
      </View>
      <Text style={styles.appName}>D&G E-COMMERCE</Text>
      <View style={styles.taglineBadge}>
        <Text style={styles.taglineText}>RWAMAGANA, RWANDA</Text>
      </View>
      <ActivityIndicator
        size="large"
        color={COLORS.yellow}
        style={styles.spinner}
      />
      <Text style={styles.loadingText}>Loading Your Retail Store...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.blue,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  logoCard: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: COLORS.white,
    borderColor: COLORS.yellow,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    elevation: 8,
    overflow: 'hidden',
    padding: 10,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  appName: {
    fontSize: 26,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: 2,
    marginBottom: 10,
  },
  taglineBadge: {
    backgroundColor: COLORS.yellow,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.white,
    marginBottom: 40,
  },
  taglineText: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.blue,
    letterSpacing: 1,
  },
  spinner: {
    marginTop: 20,
    marginBottom: 12,
  },
  loadingText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
});

export default SplashScreen;
