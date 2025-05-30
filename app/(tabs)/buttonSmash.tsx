import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Animated } from 'react-native';

const sendScoreToServer = async (score: number) => {
  try {
    await fetch('https://parkinsonschartsbackend.onrender.com/buttonSmash', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ score}),
    });
  } catch (err) {
    console.error('Failed to send score:', err);
  }
};

const ButtonSmash = () => {
  const [count, setCount] = useState(0);
  const [time, setTime] = useState(5); // Changed initial time to 5 seconds
  const [gameActive, setGameActive] = useState(false);
  const [results, setResults] = useState<Array<{date: string, score: number}>>([]);
  
  const timer = useRef<NodeJS.Timeout | undefined>();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Ref to hold the latest count value, accessible by endGame's closure
  const countRef = useRef(count);
  useEffect(() => {
    countRef.current = count;
  }, [count]);

  const startGame = () => {
    setGameActive(true);
    setCount(0);
    setTime(5); // Game duration set to 5 seconds
    
    if (timer.current) {
      clearInterval(timer.current);
    }
    timer.current = setInterval(() => {
      setTime(prev => {
        if (prev <= 0.1) {
          endGame();
          return 0;
        }
        return prev - 0.1;
      });
    }, 100);
  };

  const endGame = () => {
    clearInterval(timer.current);
    timer.current = undefined; // Explicitly clear the ref
    setGameActive(false);
    
    const todayScore = countRef.current; // Use ref to get the latest count
    setResults(prev => [{
      date: new Date().toLocaleDateString(),
      score: todayScore
    }, ...prev.slice(0, 4)]);

    sendScoreToServer(todayScore);
  };

  const handlePress = () => {
    if (!gameActive) return;
    
    setCount(prev => prev + 1);
    
    // Visual feedback
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 50,
        useNativeDriver: true
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 50,
        useNativeDriver: true
      })
    ]).start();
  };

  // Cleanup timer on component unmount
  useEffect(() => {
    return () => {
      if (timer.current) {
        clearInterval(timer.current);
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Button Consistency Test</Text>
      {!gameActive ? (
        <View style={styles.instructions}>
          <Text>Press the button rapidly for 5 seconds</Text>
          <TouchableOpacity style={styles.startButton} onPress={startGame}>
            <Text style={styles.buttonText}>Start Test</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.gameArea}>
          <Text style={styles.timer}>{time.toFixed(1)}s</Text>
          <Text style={styles.count}>{count} presses</Text>
          
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity 
              style={styles.targetButton}
              onPress={handlePress}
              activeOpacity={0.7}
            >
              <Text style={styles.buttonText}>PRESS</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}
      
      {results.length > 0 && (
        <View style={styles.results}>
          <Text>Previous Results (total presses):</Text>
          {results.map((result, i) => (
            <Text key={i}>{result.date}: {result.score}</Text>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, marginBottom: 20 },
  instructions: { alignItems: 'center', marginVertical: 30 },
  gameArea: { flex: 1, alignItems: 'center' },
  timer: { fontSize: 40, marginVertical: 20 },
  count: { fontSize: 24, marginBottom: 40 },
  startButton: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 10,
    marginTop: 20
  },
  targetButton: {
    backgroundColor: 'red',
    width: 150,
    height: 150,
    borderRadius: 75,
    justifyContent: 'center',
    alignItems: 'center'
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold'
  },
  results: { marginTop: 30 }
});

export default ButtonSmash;