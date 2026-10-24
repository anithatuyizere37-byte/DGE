import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import COLORS from '../constants/colors';

export type OrderStage = 'placed' | 'confirmed' | 'processing' | 'out_for_delivery' | 'delivered';

interface TimelineProps {
  currentStage: OrderStage;
  cancelled?: boolean;
}

const STAGES: { key: OrderStage; label: string; description: string }[] = [
  { key: 'placed', label: '1. Order Placed', description: 'Order received by shop' },
  { key: 'confirmed', label: '2. Confirmed', description: 'Store verified stock' },
  { key: 'processing', label: '3. Processing', description: 'Packed & ready in Rwamagana' },
  { key: 'out_for_delivery', label: '4. Out for Delivery', description: 'With courier to your address' },
  { key: 'delivered', label: '5. Delivered', description: 'Delivered and completed' },
];

export const Timeline: React.FC<TimelineProps> = ({ currentStage, cancelled = false }) => {
  const getStageIndex = (stage: OrderStage): number => {
    switch (stage) {
      case 'placed':
        return 0;
      case 'confirmed':
        return 1;
      case 'processing':
        return 2;
      case 'out_for_delivery':
        return 3;
      case 'delivered':
        return 4;
      default:
        return 0;
    }
  };

  const activeIndex = getStageIndex(currentStage);

  if (cancelled) {
    return (
      <View style={styles.cancelledBox}>
        <Text style={styles.cancelledTitle}>ORDER CANCELLED</Text>
        <Text style={styles.cancelledSub}>
          This order has been cancelled. Contact D&G Rwamagana for questions.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {STAGES.map((s, index) => {
        const isCompleted = index < activeIndex;
        const isCurrent = index === activeIndex;
        const isFuture = index > activeIndex;

        return (
          <View key={s.key} style={styles.stageRow}>
            {/* Left timeline indicator */}
            <View style={styles.indicatorCol}>
              <View
                style={[
                  styles.circle,
                  isCurrent && styles.currentCircle,
                  isCompleted && styles.completedCircle,
                  isFuture && styles.futureCircle,
                ]}
              >
                {isCompleted ? (
                  <Ionicons name="checkmark" size={14} color={COLORS.blue} />
                ) : (
                  <Text
                    style={[
                      styles.circleText,
                      isCurrent ? styles.activeCircleText : styles.futureCircleText,
                    ]}
                  >
                    {index + 1}
                  </Text>
                )}
              </View>
              {index < STAGES.length - 1 && (
                <View
                  style={[
                    styles.line,
                    isCompleted ? styles.completedLine : styles.futureLine,
                  ]}
                />
              )}
            </View>

            {/* Stage description */}
            <View style={styles.contentCol}>
              <Text
                style={[
                  styles.stageLabel,
                  isCurrent && styles.currentLabel,
                  isCompleted && styles.completedLabel,
                ]}
              >
                {s.label}
              </Text>
              <Text style={styles.stageDescription}>{s.description}</Text>
              {isCurrent && (
                <View style={styles.activePill}>
                  <Text style={styles.activePillText}>IN PROGRESS</Text>
                </View>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  stageRow: {
    flexDirection: 'row',
    minHeight: 64,
  },
  indicatorCol: {
    alignItems: 'center',
    width: 36,
  },
  circle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  completedCircle: {
    backgroundColor: COLORS.blue,
    borderColor: COLORS.yellow,
  },
  currentCircle: {
    backgroundColor: COLORS.yellow,
    borderColor: COLORS.blue,
  },
  futureCircle: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.blue,
  },
  circleText: {
    fontSize: 12,
    fontWeight: '900',
  },
  activeCircleText: {
    color: COLORS.blue,
  },
  futureCircleText: {
    color: COLORS.blue,
  },
  line: {
    width: 3,
    flex: 1,
    marginVertical: 2,
  },
  completedLine: {
    backgroundColor: COLORS.blue,
  },
  futureLine: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.blue,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  contentCol: {
    flex: 1,
    marginLeft: 12,
    paddingBottom: 16,
  },
  stageLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.blue,
  },
  currentLabel: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.blue,
  },
  completedLabel: {
    color: COLORS.blue,
  },
  stageDescription: {
    fontSize: 12,
    color: COLORS.blue,
    opacity: 0.85,
    marginTop: 2,
  },
  activePill: {
    marginTop: 6,
    backgroundColor: COLORS.yellow,
    borderColor: COLORS.blue,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  activePillText: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.blue,
  },
  cancelledBox: {
    backgroundColor: COLORS.yellow,
    borderColor: COLORS.blue,
    borderWidth: 2,
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
  },
  cancelledTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.blue,
  },
  cancelledSub: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.blue,
    textAlign: 'center',
    marginTop: 4,
  },
});

export default Timeline;
