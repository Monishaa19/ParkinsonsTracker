import React, { useEffect, useState } from 'react';
import { View, Text, Dimensions, ActivityIndicator, StyleSheet, ScrollView } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get("window").width;

export default function AnalyticsScreen() {
  const [scores, setScores] = useState<number[]>([]);
  const [times, setTimes] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScoreData = fetch('https://parkinsonschartsbackend.onrender.com/brainDots/latest/5').then(res => res.json());
    

    Promise.all([fetchScoreData, ])
      .then(([scoreData, ]) => {
        const scoreReversed = scoreData.reverse(); // oldest to latest
          // oldest to latest

        setScores(scoreReversed.map((item: any) => item.score));
        
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
      <Text style={styles.title}>Braindots Moves Trend</Text>
      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <>
          <LineChart
            data={{
              labels: ['1', '2', '3', '4', '5'],
              datasets: [{ data: scores }]
            }}
            width={screenWidth - 32}
            height={220}
            chartConfig={chartConfig}
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
