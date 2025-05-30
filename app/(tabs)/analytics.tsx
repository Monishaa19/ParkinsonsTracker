import React from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';

interface BarData {
  label: string;
  value: number;
  color: string;
}

interface ActivityData {
  label: string;
  value: number;
  color: string;
}

export default function AnalyticsScreen() {
  // Sample data for charts
  const bars: BarData[] = [
    { label: 'Mon', value: 45, color: '#3498db' },
    { label: 'Tue', value: 52, color: '#3498db' },
    { label: 'Wed', value: 49, color: '#3498db' },
    { label: 'Thu', value: 60, color: '#3498db' },
    { label: 'Fri', value: 55, color: '#3498db' },
    { label: 'Sat', value: 40, color: '#3498db' },
    { label: 'Sun', value: 48, color: '#3498db' },
  ];
  
  const activities: ActivityData[] = [
    { label: 'Walking', value: 30, color: '#2ecc71' },
    { label: 'Standing', value: 20, color: '#e74c3c' },
    { label: 'Sitting', value: 40, color: '#f39c12' },
    { label: 'Lying', value: 10, color: '#9b59b6' },
  ];

  const maxBarValue = Math.max(...bars.map(bar => bar.value));
  const screenWidth = Dimensions.get('window').width - 60;

  return (
    <View style={styles.analyticsContainer}>
      <Text style={styles.analyticsTitle}>Patient Activity Analytics</Text>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Weekly Tremor Intensity</Text>
        <View style={styles.barChartContainer}>
          {bars.map((bar, index) => (
            <View key={index} style={styles.barGroup}>
              <View style={styles.barContainer}>
                <View 
                  style={[
                    styles.bar, 
                    { 
                      height: (bar.value / maxBarValue) * 150,
                      backgroundColor: bar.color
                    }
                  ]}
                />
              </View>
              <Text style={styles.barLabel}>{bar.label}</Text>
            </View>
          ))}
        </View>
      </View>
      
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Daily Activity Distribution (%)</Text>
        <View style={styles.pieChartContainer}>
          {activities.map((activity, index) => (
            <View key={index} style={styles.pieChartLegendItem}>
              <View style={[styles.legendColor, { backgroundColor: activity.color }]} />
              <Text style={styles.legendLabel}>{activity.label}: {activity.value}%</Text>
            </View>
          ))}
          <View style={styles.pieChartVisual}>
            {activities.map((activity, index) => {
              const startAngle = activities
                .slice(0, index)
                .reduce((sum, a) => sum + a.value, 0) * 3.6;
              return (
                <View 
                  key={index} 
                  style={[
                    styles.pieSlice,
                    { 
                      backgroundColor: activity.color,
                      transform: [
                        { rotate: `${startAngle}deg` },
                        { skewX: `${activity.value * 3.6 - 90}deg` }
                      ],
                      opacity: 0.8
                    }
                  ]}
                />
              );
            })}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  analyticsContainer: {
    flex: 1,
    padding: 20, 
  },
  analyticsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2c3e50',
  },
  chartContainer: {
    marginBottom: 30,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#34495e',
  },
  barChartContainer: {
    flexDirection: 'row',
    height: 200,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: 20,
  },
  barGroup: {
    flex: 1,
    alignItems: 'center',
  },
  barContainer: {
    height: 150,
    justifyContent: 'flex-end',
  },
  bar: {
    width: 20,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  barLabel: {
    fontSize: 12,
    marginTop: 5,
    color: '#7f8c8d',
  },
  pieChartContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  pieChartLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    width: '45%',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendLabel: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  pieChartVisual: {
    width: 150,
    height: 150,
    borderRadius: 75,
    overflow: 'hidden',
    position: 'relative',
    alignSelf: 'center',
    marginTop: 10,
  },
  pieSlice: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
  },
});