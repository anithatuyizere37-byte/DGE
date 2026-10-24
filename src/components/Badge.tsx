import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import COLORS from '../constants/colors';

export type BadgeVariant = 'yellow' | 'blue' | 'outline';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
  textStyle?: TextStyle;
  size?: 'small' | 'medium';
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'yellow',
  style,
  textStyle,
  size = 'small',
}) => {
  const getContainerStyle = (): ViewStyle => {
    switch (variant) {
      case 'blue':
        return {
          backgroundColor: COLORS.blue,
          borderColor: COLORS.yellow,
          borderWidth: 1.5,
        };
      case 'outline':
        return {
          backgroundColor: COLORS.white,
          borderColor: COLORS.blue,
          borderWidth: 1.5,
        };
      case 'yellow':
      default:
        return {
          backgroundColor: COLORS.yellow,
          borderColor: COLORS.blue,
          borderWidth: 1.5,
        };
    }
  };

  const getTextStyle = (): TextStyle => {
    switch (variant) {
      case 'blue':
        return {
          color: COLORS.yellow,
        };
      case 'outline':
      case 'yellow':
      default:
        return {
          color: COLORS.blue,
        };
    }
  };

  const isSmall = size === 'small';

  return (
    <View
      style={[
        styles.badge,
        getContainerStyle(),
        {
          paddingVertical: isSmall ? 3 : 6,
          paddingHorizontal: isSmall ? 8 : 12,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          getTextStyle(),
          { fontSize: isSmall ? 11 : 13 },
          textStyle,
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});

export default Badge;
