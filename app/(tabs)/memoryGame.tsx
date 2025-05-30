import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Animated } from 'react-native';

const sendScoreToServer = async (score: number) => {
  try {
    await fetch('https://parkinsonschartsbackend.onrender.com/brainDots', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ score}),
    });
  } catch (err) {
    console.error('Failed to send score:', err);
  }
};

const MemoryGame = () => {
  const [cards, setCards] = useState<Array<{id: number, type: string, flipped: boolean, matched: boolean}>>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  
  const jewelTypes = ['💎', '🔶', '🔷', '💍', '💠', '🔴', '🟢', '🔵'];

  const initializeGame = () => {
    // Create pairs of jewels
    let gameCards: Array<{id: number, type: string, flipped: boolean, matched: boolean}> = [];
    jewelTypes.forEach((type, index) => {
      gameCards.push(
        { id: index*2, type, flipped: false, matched: false },
        { id: index*2+1, type, flipped: false, matched: false }
      );
    });
    
    // Shuffle cards
    gameCards = gameCards.sort(() => Math.random() - 0.5);
    
    setCards(gameCards);
    setFlippedCards([]);
    setMoves(0);
    setGameComplete(false);
  };

  const handleCardPress = (id: number) => {
    // Don't allow more than 2 cards flipped
    if (flippedCards.length >= 2) return;
    
    // Don't allow flipping already matched cards
    const card = cards.find(c => c.id === id);
    if (card?.matched || card?.flipped) return;
    
    // Flip the card
    const updatedCards = cards.map(card => 
      card.id === id ? {...card, flipped: true} : card
    );
    setCards(updatedCards);
    
    // Add to flipped cards
    const newFlippedCards = [...flippedCards, id];
    setFlippedCards(newFlippedCards);
    
    // Check for match if two cards are flipped
    if (newFlippedCards.length === 2) {
      setMoves(prev => prev + 1);
      
      const [firstId, secondId] = newFlippedCards;
      const firstCard = cards.find(c => c.id === firstId);
      const secondCard = cards.find(c => c.id === secondId);
      
      if (firstCard?.type === secondCard?.type) {
        // Match found
        setTimeout(() => {
          setCards(prevCards => 
            prevCards.map(card => 
              card.id === firstId || card.id === secondId 
                ? {...card, matched: true} 
                : card
            )
          );
          setFlippedCards([]);
          
          // Check if game is complete
          if (updatedCards.filter(c => !c.matched).length <= 2) {
            setGameComplete(true);
          }
        }, 500);
      } else {
        // No match - flip back after delay
        setTimeout(() => {
          setCards(prevCards => 
            prevCards.map(card => 
              card.id === firstId || card.id === secondId 
                ? {...card, flipped: false} 
                : card
            )
          );
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  useEffect(() => {
    initializeGame();
  }, []);
  
  useEffect(() => {
  if (gameComplete) {
    sendScoreToServer(moves);
  }
}, [gameComplete]);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Jewel Memory Game</Text>
      
      <View style={styles.stats}>
        <Text>Moves: {moves}</Text>
        <TouchableOpacity onPress={initializeGame}>
          <Text style={styles.reset}>Reset</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.gameBoard}>
        {cards.map(card => (
          <TouchableOpacity
            key={card.id}
            style={[
              styles.card,
              card.flipped || card.matched ? styles.cardFlipped : {}
            ]}
            onPress={() => handleCardPress(card.id)}
            disabled={card.matched}
          >
            <Text style={styles.jewel}>
              {card.flipped || card.matched ? card.type : '?'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {gameComplete && (
        <View style={styles.completion}>
          <Text style={styles.congrats}>Congratulations!</Text>
          <Text>You completed the game in {moves} moves</Text>
          <TouchableOpacity 
            style={styles.button}
            onPress={initializeGame}
          >
            <Text style={styles.buttonText}>Play Again</Text>
          </TouchableOpacity>
        </View>
      )}
      
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
  stats: { 
    flexDirection: 'row', 
    justifyContent: 'space-between',
    marginBottom: 20
  },
  reset: { color: '#2196f3' },
  gameBoard: { 
    flexDirection: 'row', 
    flexWrap: 'wrap',
    justifyContent: 'center'
  },
  card: {
    width: 70,
    height: 70,
    margin: 5,
    backgroundColor: '#bbdefb',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  cardFlipped: {
    backgroundColor: '#e3f2fd'
  },
  jewel: {
    fontSize: 30
  },
  completion: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  congrats: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20
  },
  button: {
    backgroundColor: '#4caf50',
    padding: 15,
    borderRadius: 10,
    marginTop: 20
  },
  buttonText: {
    color: 'white',
    fontSize: 18
  }
});

export default MemoryGame;