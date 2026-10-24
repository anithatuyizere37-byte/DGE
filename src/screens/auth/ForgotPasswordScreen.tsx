import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import COLORS from '../../constants/colors';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Header from '../../components/Header';
import { useTranslation } from 'react-i18next';

interface ForgotPasswordScreenProps {
  navigation: any;
}

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSendReset = () => {
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid registered email');
      return;
    }
    setErrorMsg('');
    setSubmitted(true);
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.white }}>
      <Header
        title="PASSWORD RECOVERY"
        subtitle="D&G E-Commerce"
        showBack
        onBack={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={styles.container}>
        {!submitted ? (
          <View style={styles.content}>
            <View style={styles.iconCircle}>
              <Ionicons name="key-outline" size={32} color={COLORS.blue} />
            </View>
            <Text style={styles.title}>{t('auth.forgotPassword')}</Text>
            <Text style={styles.description}>
              Enter your registered email address or phone number. We will send you instructions or a reset code.
            </Text>

            <Input
              label={t('auth.email')}
              placeholder="e.g. user@rwamagana.rw"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errorMsg) setErrorMsg('');
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errorMsg}
            />

            <Button
              title="Send Reset Instructions"
              variant="primary"
              size="large"
              onPress={handleSendReset}
              style={{ marginTop: 12 }}
            />
          </View>
        ) : (
          <View style={styles.successBox}>
            <View style={styles.checkBadge}>
              <Ionicons name="checkmark" size={30} color={COLORS.blue} />
            </View>
            <Text style={styles.successTitle}>Recovery Sent!</Text>
            <Text style={styles.successDesc}>
              A password reset link or SMS code has been dispatched for {email}. Please check your inbox or phone.
            </Text>
            <Button
              title="Return to Login"
              variant="accent"
              size="medium"
              onPress={() => navigation.navigate('Login')}
              style={{ marginTop: 24, width: '100%' }}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.yellow,
    borderColor: COLORS.blue,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  iconText: {
    fontSize: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.blue,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: COLORS.blue,
    opacity: 0.85,
    textAlign: 'center',
    marginBottom: 24,
  },
  successBox: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.blue,
    borderWidth: 3,
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
  },
  checkBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.yellow,
    borderColor: COLORS.blue,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  checkText: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.blue,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.blue,
    marginBottom: 8,
  },
  successDesc: {
    fontSize: 14,
    color: COLORS.blue,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default ForgotPasswordScreen;
