import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import COLORS from '../../constants/colors';
import Button from '../../components/Button';
import { useTranslation } from 'react-i18next';

const LOGO_IMG = require('../../assets/logo.png');

interface WelcomeScreenProps {
  navigation: any;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Top Brand Banner */}
      <View style={styles.heroSection}>
        <View style={styles.logoCircle}>
          <Image
            source={LOGO_IMG}
            style={styles.logoImage}
            resizeMode="contain"
            accessibilityLabel="D&G E-Commerce Logo"
          />
        </View>
        <Text style={styles.heroTitle}>{t('auth.welcomeTitle')}</Text>
        <Text style={styles.heroSubtitle}>{t('auth.welcomeSubtitle')}</Text>
        <View style={styles.promoTag}>
          <Text style={styles.promoTagText}>CLOTHES • SHOES • BAGS • HOUSEHOLD</Text>
        </View>
      </View>

      {/* Feature Highlights */}
      <View style={styles.featuresCard}>
        <View style={styles.featureItem}>
          <View style={styles.featureBadge}>
            <Ionicons name="location-outline" size={20} color={COLORS.blue} />
          </View>
          <View style={styles.featureTextWrapper}>
            <Text style={styles.featureTitle}>Local in Rwamagana</Text>
            <Text style={styles.featureDesc}>Fast doorstep delivery within Rwamagana city and sectors.</Text>
          </View>
        </View>

        <View style={styles.featureItem}>
          <View style={styles.featureBadge}>
            <Ionicons name="cash-outline" size={20} color={COLORS.blue} />
          </View>
          <View style={styles.featureTextWrapper}>
            <Text style={styles.featureTitle}>Rwandan Francs (RWF)</Text>
            <Text style={styles.featureDesc}>Cash on Delivery or Mobile Money (MTN / Airtel).</Text>
          </View>
        </View>

        <View style={styles.featureItem}>
          <View style={styles.featureBadge}>
            <Ionicons name="shield-checkmark-outline" size={20} color={COLORS.blue} />
          </View>
          <View style={styles.featureTextWrapper}>
            <Text style={styles.featureTitle}>Authentic Quality Guaranteed</Text>
            <Text style={styles.featureDesc}>Carefully selected products with stock assurance.</Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <Button
          title={t('auth.login')}
          variant="primary"
          size="large"
          onPress={() => navigation.navigate('Login')}
          style={styles.button}
        />
        <Button
          title={t('auth.register')}
          variant="outline"
          size="large"
          onPress={() => navigation.navigate('Register')}
          style={styles.button}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: COLORS.white,
    padding: 24,
    justifyContent: 'space-between',
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  logoCircle: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: COLORS.white,
    borderColor: COLORS.blue,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    overflow: 'hidden',
    padding: 8,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.blue,
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.blue,
    textAlign: 'center',
    opacity: 0.85,
    marginBottom: 16,
  },
  promoTag: {
    backgroundColor: COLORS.yellow,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: COLORS.blue,
  },
  promoTagText: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.blue,
    letterSpacing: 0.5,
  },
  featuresCard: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.blue,
    borderWidth: 2,
    borderRadius: 14,
    padding: 16,
    marginVertical: 16,
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureBadge: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: COLORS.yellow,
    borderColor: COLORS.blue,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  featureBadgeIcon: {
    fontSize: 20,
  },
  featureTextWrapper: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.blue,
  },
  featureDesc: {
    fontSize: 12,
    color: COLORS.blue,
    opacity: 0.8,
    marginTop: 2,
  },
  actionsContainer: {
    width: '100%',
    paddingBottom: 16,
    gap: 12,
  },
  button: {
    width: '100%',
  },
});

export default WelcomeScreen;
