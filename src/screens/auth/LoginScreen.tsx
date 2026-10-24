import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import COLORS from '../../constants/colors';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';

interface LoginScreenProps {
  navigation: any;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const { login, isLoading, error, clearError } = useAuth();
  const { t } = useTranslation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState('');

  const handleLogin = async () => {
    clearError();
    setValidationError('');

    if (!email.trim()) {
      setValidationError('Please enter your email or phone number');
      return;
    }
    if (!password) {
      setValidationError('Please enter your password');
      return;
    }

    const success = await login(email.trim().toLowerCase(), password);
    if (!success) {
      // Error handled by AuthContext
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header Branding */}
        <View style={styles.header}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>D&G</Text>
          </View>
          <Text style={styles.title}>{t('auth.login')}</Text>
          <Text style={styles.subtitle}>
            Enter your credentials to access your account
          </Text>
        </View>

        {/* Form Fields */}
        <View style={styles.form}>
          <Input
            label={t('auth.email')}
            placeholder="e.g. user@example.rw or +250..."
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (validationError) setValidationError('');
            }}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Input
            label={t('auth.password')}
            placeholder="Enter your password"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (validationError) setValidationError('');
            }}
            isPassword
          />

          <TouchableOpacity
            style={styles.forgotPassword}
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Text style={styles.forgotPasswordText}>
              {t('auth.forgotPassword')}
            </Text>
          </TouchableOpacity>

          {(validationError || error) ? (
            <View style={styles.alertBanner}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="alert-circle" size={16} color={COLORS.blue} style={{ marginRight: 6 }} />
                <Text style={styles.alertText}>
                  {validationError || error}
                </Text>
              </View>
            </View>
          ) : null}

          <Button
            title={t('auth.login')}
            onPress={handleLogin}
            loading={isLoading}
            variant="primary"
            size="large"
            style={styles.submitButton}
          />
        </View>

        {/* Register Navigation */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>{t('auth.dontHaveAccount')} </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerLink}>{t('auth.register')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: COLORS.white,
    padding: 24,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  badge: {
    backgroundColor: COLORS.blue,
    borderColor: COLORS.yellow,
    borderWidth: 3,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 12,
  },
  badgeText: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.yellow,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.blue,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.blue,
    opacity: 0.85,
    textAlign: 'center',
  },
  quickAccessCard: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.blue,
    borderWidth: 2,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  quickAccessTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.blue,
    marginBottom: 8,
  },
  quickButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  quickButton: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderColor: COLORS.blue,
    borderWidth: 1.5,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  quickButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.blue,
  },
  quickButtonOwner: {
    backgroundColor: COLORS.yellow,
    borderColor: COLORS.blue,
  },
  quickButtonOwnerText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.blue,
  },
  form: {
    width: '100%',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 16,
  },
  forgotPasswordText: {
    color: COLORS.blue,
    fontSize: 13,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  alertBanner: {
    backgroundColor: COLORS.yellow,
    borderColor: COLORS.blue,
    borderWidth: 2,
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  alertText: {
    color: COLORS.blue,
    fontWeight: '800',
    fontSize: 13,
  },
  submitButton: {
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  footerText: {
    color: COLORS.blue,
    fontSize: 14,
  },
  registerLink: {
    color: COLORS.blue,
    fontWeight: '800',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  guestLinkBtn: {
    alignItems: 'center',
    paddingVertical: 10,
    marginTop: 4,
    marginBottom: 10,
  },
  guestLinkText: {
    color: COLORS.blue,
    fontSize: 13,
    fontWeight: '900',
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;
