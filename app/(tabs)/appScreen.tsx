import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import WhiteboardScreen from './whiteboard';
import AnalyticsScreen from './analytics';
import Games from './games';

export default function AppScreenLayout() {
  const [activeTab, setActiveTab] = useState('analytics');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Sidebar starts open
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <SafeAreaView style={styles.mainContainer}>
      {isSidebarOpen && (
        <View style={styles.sidebarContainer}>
          <TouchableOpacity 
            style={[
              styles.sidebarButton,
              activeTab === 'analytics' && styles.activeSidebarButton
            ]}
            onPress={() => { setActiveTab('analytics'); if (Dimensions.get('window').width < 768) setIsSidebarOpen(false); }}
          >
            <Text 
              style={[
                styles.sidebarButtonText,
                activeTab === 'analytics' && styles.activeSidebarButtonText
              ]}
            >
              Analytics
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.sidebarButton,
              activeTab === 'whiteboard' && styles.activeSidebarButton
            ]}
            onPress={() => { setActiveTab('whiteboard'); if (Dimensions.get('window').width < 768) setIsSidebarOpen(false); }}
          >
            <Text 
              style={[
                styles.sidebarButtonText,
                activeTab === 'whiteboard' && styles.activeSidebarButtonText
              ]}
            >
              Whiteboard
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.sidebarButton,
              activeTab === 'games' && styles.activeSidebarButton
            ]}
            onPress={() => { setActiveTab('games'); if (Dimensions.get('window').width < 768) setIsSidebarOpen(false); }}
          >
            <Text 
              style={[
                styles.sidebarButtonText,
                activeTab === 'games' && styles.activeSidebarButtonText
              ]}
            >
              Games
            </Text>
          </TouchableOpacity>
          
        </View>
      )}
      
      <View style={styles.mainContentArea}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={toggleSidebar} style={styles.toggleButton}>
            {/* Use Unicode characters for icons */}
            <Text style={styles.toggleButtonIcon}>{isSidebarOpen ? '☰' : '☰'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.screenContent}>
          {activeTab === 'analytics' && <AnalyticsScreen />}
          {activeTab === 'whiteboard' && <WhiteboardScreen />}
          {activeTab === 'games' && <Games />}
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
  },
  sidebarContainer: {
    width: 140, // Increased sidebar width
    backgroundColor: '#2c3e50',
    padding: 20,
    paddingTop: 40,
  },
  sidebarButton: { // Added missing style
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: 'center',
  },
  activeSidebarButton: {
    backgroundColor: '#3498db',
  },
  sidebarButtonText: {
    color: '#ecf0f1',
    fontWeight: 'bold',
  },
  activeSidebarButtonText: {
    color: 'white',
  },
  mainContentArea: { // This will contain the toggle button and the actual screen content
    flex: 1,
    flexDirection: 'column',
  },
  topBar: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#ffffff', 
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0', 
    // alignItems: 'flex-start', // We'll let the button define its padding
  },
  toggleButton: {
    // backgroundColor: '#3498db', // Removed background for a cleaner icon button
    padding: 10, // Make it easier to tap
    alignSelf: 'flex-start', // Keep it to the left
  },
  toggleButtonIcon: {
    fontSize: 24, // Larger size for icon
    color: '#2c3e50', // Icon color
  },
  screenContent: { // This holds the AnalyticsScreen or WhiteboardScreen
    flex: 1,
    backgroundColor: '#f5f5f5', // Ensure content area has a background
  },
});

// A small addition to auto-close sidebar on item selection on smaller screens
import { Dimensions } from 'react-native';