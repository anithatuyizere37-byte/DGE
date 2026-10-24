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

interface RegisterScreenProps {
  navigation: any;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const { register, isLoading, error, clearError } = useAuth();
  const { t } = useTranslation();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [formError, setFormError] = useState('');

  const handleRegister = async () => {
    clearError();
    setFormError('');

    if (!fullName.trim()) {
      setFormError('Please enter your full name');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setFormError('Please enter a valid email address');
      return;
    }
    if (!phoneNumber.trim()) {
      setFormError('Please enter your Rwandan phone number');
      return;
    }
    if (password.length < 6) {
      setFormError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }
    if (!acceptedTerms) {
      setFormError('You must agree to the Terms and Conditions');
      return;
    }

    const success = await register({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phoneNumber: phoneNumber.trim(),
      password,
    });

    if (success) {
      // Navigation will be automatically updated by RootNavigator auth guard
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('auth.register')}</Text>
          <Text style={styles.subtitle}>
            Join D&G E-Commerce Rwamagana as a shopper
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label={t('auth.fullName')}
            placeholder="e.g. Marie Claire Uwera"
            value={fullName}
            onChangeText={setFullName}
          />

          <Input
            label={t('auth.email')}
            placeholder="e.g. marie@rwamagana.rw"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Input
            label={t('auth.phoneNumber')}
            placeholder="e.g. +250 788 123 456"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
          />

          <Input
            label={t('auth.password')}
            placeholder="Minimum 6 characters"
            value={password}
            onChangeText={setPassword}
            isPassword
          />

          <Input
            label={t('auth.confirmPassword')}
            placeholder="Re-enter password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            isPassword
          />

          {/* Terms & Conditions Checkbox (Strictly using Blue & Yellow) */}
          <TouchableOpacity
            style={styles.termsRow}
            onPress={() => setAcceptedTerms(!acceptedTerms)}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.checkbox,
                acceptedTerms && styles.checkboxActive,
              ]}
            >
              {acceptedTerms && <Ionicons name="checkmark" size={14} color={COLORS.blue} />}
            </View>
            <Text style={styles.termsText}>{t('auth.termsAccept')}</Text>
          </TouchableOpacity>

          {(formError || error) ? (
            <View style={styles.alertBanner}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="alert-circle" size={16} color={COLORS.blue} style={{ marginRight: 6 }} />
                <Text style={styles.alertText}>{formError || error}</Text>
              </View>
            </View>
          ) : null}

          <Button
            title={t('auth.register')}
            onPress={handleRegister}
            loading={isLoading}
            variant="primary"
            size="large"
            style={styles.submitButton}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>{t('auth.alreadyHaveAccount')} </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>{t('auth.login')}</Text>
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
    marginTop: 10,
    marginBottom: 20,
    alignItems: 'center',
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
  form: {
    width: '100%',
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.blue,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checkboxActive: {
    backgroundColor: COLORS.yellow,
    borderColor: COLORS.blue,
  },
  checkmark: {
    color: COLORS.blue,
    fontSize: 14,
    fontWeight: '900',
  },
  termsText: {
    color: COLORS.blue,
    fontSize: 13,
    fontWeight: '600',
  },
  alertBanner: {
    backgroundColor: COLORS.yellow,
    borderColor: COLORS.blue,
    borderWidth: 2,
    borderRadius: 8,
    padding: 10,
    marginVertical: 12,
  },
  alertText: {
    color: COLORS.blue,
    fontWeight: '800',
    fontSize: 13,
  },
  submitButton: {
    marginTop: 10,
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
  loginLink: {
    color: COLORS.blue,
    fontWeight: '800',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});

export default RegisterScreen;
