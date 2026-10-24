import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import COLORS from '../constants/colors';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  highlighted?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  highlighted = false,
}) => {
  return (
    <View
      style={[
        styles.card,
        highlighted && styles.highlightedCard,
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.blue,
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
  },
  highlightedCard: {
    borderColor: COLORS.yellow,
    borderWidth: 3,
  },
});

export default Card;
