import React from 'react';
import { ScrollView, View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ConnectDotsScreen1 from './connectDotsScoreChart';
import ConnectDotsScreen2 from './connectTheDotsTimeChart';
import LineJitterScreen from './lineJitterChart';
import FlowerWaterScreen from './gardenChart';
import ButtonSmashScreen from './buttonSmashChart';
import MemoryGameScreen from './brainDotsChart';

const Analytics = () => {
  const handleRefresh = () => {
    // Force a re-render of the component
    window.location.reload();
  };

  return (
    <ScrollView style={styles.container}>
      {/* Add Refresh Button at the top */}
      <TouchableOpacity 
        style={styles.refreshButton} 
        onPress={handleRefresh}
      >
        <Ionicons name="refresh" size={24} color="#fff" />
        <Text style={styles.refreshText}>Refresh</Text>
      </TouchableOpacity>

    
      <View style={styles.section}>
        <ConnectDotsScreen1 />
      </View>
       <View style={styles.section}>
        <ConnectDotsScreen2 />
      </View>
      
      <View style={styles.section}>
        <LineJitterScreen />
      </View>
      <View style={styles.section}>
        <FlowerWaterScreen />
      </View>
      <View style={styles.section}>
        <ButtonSmashScreen />
      </View>
      <View style={styles.section}>
        <MemoryGameScreen />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  section: {
    marginBottom: 20,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    margin: 16,
    marginTop:30,
    justifyContent: 'center',
    marginBottom:0
  },
  refreshText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default Analytics;