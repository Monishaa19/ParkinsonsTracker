import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';

const sendScoreToServer = async (time: number) => {
  try {
    await fetch('/garden', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({time }),
    });
  } catch (err) {
    console.error('Failed to send score:', err);
  }
};
const FlowerWater = () => {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameActive, setGameActive] = useState(false);
  const [flowers, setFlowers] = useState<
    Array<{ id: number; x: number; y: number; watered: boolean }>
  >([]);
  const [elapsedTime, setElapsedTime] = useState(0);

  const waterPos = useRef(new Animated.ValueXY({ x: -100, y: -100 })).current;
  const timer = useRef<NodeJS.Timeout>();
  const startTimestamp = useRef<number>(0);

  const generateFlowers = () => {
    const newFlowers = [];
    for (let i = 0; i < 8; i++) {
      newFlowers.push({
        id: i,
        x: Math.random() * Dimensions.get('window').width * 0.8,
        y: 100 + Math.random() * Dimensions.get('window').height * 0.5,
        watered: false,
      });
    }
    setFlowers(newFlowers);
  };

  const startGame = () => {
    generateFlowers();
    setGameActive(true);
    setTimeLeft(30);
    setScore(0);
    setElapsedTime(0);
    startTimestamp.current = Date.now();

    timer.current = setInterval(() => {
      const newTime = 30 - Math.floor((Date.now() - startTimestamp.current) / 1000);
      if (newTime <= 0) {
        endGame();
        return;
      }
      setTimeLeft(newTime);
    }, 500);
  };

  const endGame = () => {
    clearInterval(timer.current);
    setGameActive(false);
    const finalTime = Math.floor((Date.now() - startTimestamp.current) / 1000);
    setElapsedTime(finalTime);
    sendScoreToServer(finalTime);
  };

  const handleMove = (e: any) => {
    if (!gameActive) return;

    const { pageX, pageY } = e.nativeEvent;

    waterPos.setValue({
      x: pageX - 25,
      y: pageY - 25,
    });

    const updatedFlowers = flowers.map((flower) => {
      const distance = Math.sqrt(
        Math.pow(pageX - flower.x, 2) + Math.pow(pageY - flower.y, 2)
      );

      if (distance < 40 && !flower.watered) {
        setScore((prev) => prev + 10);
        return { ...flower, watered: true };
      }
      return flower;
    });

    setFlowers(updatedFlowers);

    const allWatered = updatedFlowers.every((flower) => flower.watered);
    if (allWatered) endGame();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🌼 Flower Watering Game 🌼</Text>

      {!gameActive && flowers.length > 0 ? (
        <View style={styles.instructions}>
          <Text style={styles.resultText}>
            Game Over! Score: {score}
          </Text>
          <Text style={styles.resultText}>
            Time Taken: {elapsedTime}s
          </Text>
          <TouchableOpacity style={styles.button} onPress={startGame}>
            <Text style={styles.buttonText}>Play Again</Text>
          </TouchableOpacity>
        </View>
      ) : !gameActive ? (
        <View style={styles.instructions}>
          <Text>Water all the flowers before time runs out!</Text>
          <TouchableOpacity style={styles.button} onPress={startGame}>
            <Text style={styles.buttonText}>Start</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.gameArea}>
          <Text style={styles.statusText}>⏱ Time: {timeLeft}s | 🌟 Score: {score}</Text>

          <View
            style={styles.touchArea}
            onTouchMove={handleMove}
            onTouchEnd={() => waterPos.setValue({ x: -100, y: -100 })}
          >
            {flowers.map((flower) => (
              <FontAwesome5
                key={flower.id}
                name="seedling"
                size={30}
                color={flower.watered ? '#4caf50' : '#f44336'}
                style={{
                  position: 'absolute',
                  left: flower.x,
                  top: flower.y,
                }}
              />
            ))}

            <Animated.View
              style={[
                styles.waterCan,
                {
                  transform: [
                    { translateX: waterPos.x },
                    { translateY: waterPos.y },
                  ],
                },
              ]}
            >
              <FontAwesome name="tint" size={40} color="#00bcd4" />
            </Animated.View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  instructions: { alignItems: 'center', marginVertical: 30 },
  resultText: { fontSize: 20, marginVertical: 5 },
  button: {
    backgroundColor: '#4caf50',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    paddingHorizontal: 30,
  },
  buttonText: { color: 'white', fontSize: 18 },
  gameArea: { flex: 1 },
  touchArea: {
    flex: 1,
    backgroundColor: '#e1f5fe',
    marginVertical: 20,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 10,
  },
  waterCan: {
    position: 'absolute',
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.8,
  },
});

export default FlowerWater;
