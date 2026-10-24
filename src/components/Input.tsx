import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import COLORS from '../constants/colors';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  isPassword?: boolean;
  containerStyle?: ViewStyle;
  leftIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  isPassword = false,
  containerStyle,
  leftIcon,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.focusedInput,
          !!error && styles.errorInputContainer,
        ]}
      >
        {leftIcon && <View style={styles.iconWrapper}>{leftIcon}</View>}
        <TextInput
          style={styles.textInput}
          placeholderTextColor={COLORS.blue}
          secureTextEntry={isPassword && !showPassword}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          selectionColor={COLORS.yellow}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Text style={styles.toggleText}>
              {showPassword ? 'HIDE' : 'SHOW'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      {error ? (
        <View style={styles.errorBadge}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="alert-circle" size={14} color={COLORS.blue} style={{ marginRight: 4 }} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.blue,
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderColor: COLORS.blue,
    borderWidth: 2,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 50,
  },
  focusedInput: {
    borderColor: COLORS.yellow,
    borderWidth: 2.5,
  },
  errorInputContainer: {
    borderColor: COLORS.blue,
    backgroundColor: COLORS.white,
    borderWidth: 2.5,
  },
  textInput: {
    flex: 1,
    color: COLORS.blue,
    fontSize: 15,
    height: '100%',
  },
  iconWrapper: {
    marginRight: 8,
  },
  toggleButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: COLORS.yellow,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.blue,
  },
  toggleText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.blue,
  },
  errorBadge: {
    marginTop: 6,
    backgroundColor: COLORS.yellow,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.blue,
    alignSelf: 'flex-start',
  },
  errorText: {
    color: COLORS.blue,
    fontSize: 12,
    fontWeight: '700',
  },
});

export default Input;
