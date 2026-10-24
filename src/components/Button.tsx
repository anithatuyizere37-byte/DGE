import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import COLORS from '../constants/colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'accent' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
}) => {
  const getContainerStyle = (): ViewStyle => {
    switch (variant) {
      case 'accent':
        return {
          backgroundColor: COLORS.yellow,
          borderColor: COLORS.blue,
          borderWidth: 2,
        };
      case 'outline':
        return {
          backgroundColor: COLORS.white,
          borderColor: COLORS.blue,
          borderWidth: 2,
        };
      case 'primary':
      default:
        return {
          backgroundColor: COLORS.blue,
          borderColor: COLORS.blue,
          borderWidth: 2,
        };
    }
  };

  const getTextStyle = (): TextStyle => {
    switch (variant) {
      case 'accent':
        return {
          color: COLORS.blue,
        };
      case 'outline':
        return {
          color: COLORS.blue,
        };
      case 'primary':
      default:
        return {
          color: COLORS.white,
        };
    }
  };

  const getSizeStyle = (): ViewStyle => {
    switch (size) {
      case 'small':
        return { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8 };
      case 'large':
        return { paddingVertical: 16, paddingHorizontal: 24, borderRadius: 14 };
      case 'medium':
      default:
        return { paddingVertical: 12, paddingHorizontal: 18, borderRadius: 10 };
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.base,
        getContainerStyle(),
        getSizeStyle(),
        disabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? COLORS.yellow : COLORS.blue}
        />
      ) : (
        <>
          {icon}
          <Text style={[styles.text, getTextStyle(), textStyle]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  text: {
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
});

export default Button;
