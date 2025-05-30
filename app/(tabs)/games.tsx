import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions , ScrollView} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import your game screen components
import ConnectDotsScreen from './connectDots';
import LineJitterScreen from './lineJitter';
import FlowerWaterScreen from './flowerWaterGame';
import ButtonSmashScreen from './buttonSmash';
import MemoryGameScreen from './memoryGame';

// Note: router from 'expo-router' is no longer needed for this internal navigation

const games = [
  { name: 'Connect the Dots', icon: 'scatter-plot', color: '#4f8cff', screen: 'ConnectDots' },
  { name: 'Jittery Line', icon: 'show-chart', color: '#ff6b6b', screen: 'LineJitter'},
  { name: 'Gardenscapes', icon: 'local-florist', color: '#4ecdc4', screen: 'FlowerWaterGame' }, // Maps to FlowerWaterGame.tsx
  { name: 'Button Smash', icon: 'touch-app', color: '#45b7d1', screen: 'ButtonSmash' },
  { name: 'Brain Dots', icon: 'psychology', color: '#f9ca24', screen: 'MemoryGame'}, // Maps to MemoryGame.tsx
];


const CARD_MARGIN = 16;
const CARD_SIZE = (Dimensions.get('window').width - CARD_MARGIN * 3) / 2;

const Games = () => {
  const [activeGameKey, setActiveGameKey] = useState<string | null>(null);

  const gameComponentsMap: Record<string, React.ComponentType<any>> = {
    ConnectDots: ConnectDotsScreen,
    LineJitter: LineJitterScreen,
    FlowerWaterGame: FlowerWaterScreen,
    ButtonSmash: ButtonSmashScreen,
    MemoryGame: MemoryGameScreen,
  };

  if (activeGameKey) {
    const GameComponent = gameComponentsMap[activeGameKey];
    if (!GameComponent) {
      // Fallback if the key is somehow invalid
      setActiveGameKey(null);
      return null;
    }
    return (
      <View style={styles.activeGameContainer}>
        <TouchableOpacity onPress={() => setActiveGameKey(null)} style={styles.backToListButton}>
          <Icon name="arrow-back" size={24} color="#22223b" />
          <Text style={styles.backToListButtonText}>Back to Games</Text>
        </TouchableOpacity>
        <GameComponent />
      </View>
    );
  }

  return (
    <ScrollView style={styles.scrollViewContainer}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.heading}>Select a Game</Text>
          <Text style={styles.subheading}>Choose your favorite game</Text>
        </View>
        
        <View style={styles.grid}>
          {games.map((game) => (
            <TouchableOpacity
              key={game.name}
              style={[styles.card, { backgroundColor: game.color }]}
              onPress={() => {
                setActiveGameKey(game.screen); // Update state to show the game
              }}
              activeOpacity={0.8}
            >
              <View style={styles.iconContainer}>
                <Icon name={game.icon} size={40} color="#fff" />
              </View>
              <Text style={styles.cardText}>{game.name}</Text>
              <View style={styles.playButton}>
                <Icon name="play-arrow" size={20} color="#fff" />
              </View>
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={styles.footer}>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Icon name="games" size={24} color="#4f8cff" />
              <Text style={styles.statNumber}>5</Text>
              <Text style={styles.statLabel}>Games</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="star" size={24} color="#f9ca24" />
              <Text style={styles.statNumber}>4.8</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="people" size={24} color="#4ecdc4" />
              <Text style={styles.statNumber}>1.2M</Text>
              <Text style={styles.statLabel}>Players</Text>
            </View>
          </View>
        </View>
      </View>
  
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollViewContainer: { // Added to ensure ScrollView takes flex
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
    padding: CARD_MARGIN,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 16,
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#22223b',
    marginBottom: 8,
  },
  subheading: {
    fontSize: 16,
    color: '#6c757d',
    fontWeight: '400',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    flex: 1,
  },
  card: {
    width: CARD_SIZE,
    height: CARD_SIZE * 1.1,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: CARD_MARGIN,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    position: 'relative',
    padding: 16,
  },
  iconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 50,
    padding: 16,
    marginBottom: 12,
  },
  cardText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  playButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 8,
  },
  footer: {
    marginTop: 16,
    paddingVertical: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#22223b',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '500',
  },
  activeGameContainer: { // Styles for when a game is active
    flex: 1,
    backgroundColor: '#f5f6fa', // Or your game's background
  },
  backToListButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16, // Increased padding for better touchability
    backgroundColor: '#e9ecef', // A light background for the button area
  },
  backToListButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#22223b',
    fontWeight: '600',
  },
});

export default Games;