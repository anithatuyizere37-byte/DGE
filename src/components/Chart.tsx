import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import COLORS from '../constants/colors';

interface BarData {
  label: string;
  value: number;
}

interface BarChartProps {
  data: BarData[];
  title?: string;
  unit?: string;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  title,
  unit = 'RWF',
}) => {
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <View style={styles.container}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      <View style={styles.chartArea}>
        {data.map((item, index) => {
          const heightPercent = Math.max((item.value / maxValue) * 100, 8);
          const isHighlight = index === data.length - 1; // latest bar

          return (
            <View key={item.label} style={styles.barCol}>
              <Text style={styles.valueText} numberOfLines={1}>
                {item.value >= 1000 ? `${(item.value / 1000).toFixed(0)}k` : item.value}
              </Text>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    { height: `${heightPercent}%` },
                    isHighlight ? styles.highlightBar : styles.regularBar,
                  ]}
                />
              </View>
              <Text style={styles.labelText}>{item.label}</Text>
            </View>
          );
        })}
      </View>
      <View style={styles.footerLegend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: COLORS.blue }]} />
          <Text style={styles.legendText}>Historical Sales</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: COLORS.yellow }]} />
          <Text style={styles.legendText}>Recent / Peak Period</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.blue,
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    marginVertical: 10,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.blue,
    marginBottom: 16,
  },
  chartArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 140,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.blue,
    paddingBottom: 4,
  },
  barCol: {
    alignItems: 'center',
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
    paddingHorizontal: 2,
  },
  valueText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.blue,
    marginBottom: 4,
  },
  barTrack: {
    width: '75%',
    maxWidth: 28,
    height: 100,
    justifyContent: 'flex-end',
    borderRadius: 4,
  },
  barFill: {
    width: '100%',
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: COLORS.blue,
  },
  regularBar: {
    backgroundColor: COLORS.blue,
  },
  highlightBar: {
    backgroundColor: COLORS.yellow,
    borderWidth: 2,
  },
  labelText: {
    marginTop: 6,
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.blue,
  },
  footerLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendBox: {
    width: 12,
    height: 12,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: COLORS.blue,
  },
  legendText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.blue,
  },
});

export default BarChart;
