import React, { useEffect, useState } from 'react';
import { View, Text, Dimensions, ActivityIndicator, StyleSheet, ScrollView } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get("window").width;

export default function AnalyticsScreen() {
 
  const [times, setTimes] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
   
    const fetchTimeData = fetch('https://parkinsonschartsbackend.onrender.com/connectTheDots/latest/5').then(res => res.json());

    Promise.all([fetchTimeData])
      .then(([timeData]) => {
       
        const timeReversed = timeData.reverse();   // oldest to latest

      
        setTimes(timeReversed.map((item: any) => item.time));
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const chartConfig = {
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
    strokeWidth: 2,
    labelColor: () => "#333",
    propsForDots: {
      r: "4",
      strokeWidth: "2",
      stroke: "#007AFF"
    }
  };

  const redChartConfig = {
    ...chartConfig,
    color: (opacity = 1) => `rgba(255, 99, 132, ${opacity})`,
    propsForDots: {
      r: "4",
      strokeWidth: "2",
      stroke: "#FF6384"
    }
  };

  return (
    <ScrollView style={styles.container}>
      
      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <>
          

          <Text style={styles.title}>Connect The Dots Time Trend</Text>
          <LineChart
            data={{
              labels: ['1', '2', '3', '4', '5'],
              datasets: [{ data: times }]
            }}
            width={screenWidth - 32}
            height={220}
            chartConfig={redChartConfig}
            bezier
            style={styles.chart}
          />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginTop: 40,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginVertical: 12,
    textAlign: 'center',
  },
  chart: {
    borderRadius: 16,
    marginBottom: 24,
  }
});
