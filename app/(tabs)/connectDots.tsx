import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, PanResponder, Text, Dimensions, TouchableOpacity } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';


const sendScoreToServer = async (score: number, time: number) => {
  try {
    await fetch('https://parkinsonschartsbackend.onrender.com/connectTheDots', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ score, time }),
    });
  } catch (err) {
    console.error('Failed to send score:', err);
  }
};

const ConnectDots = () => {
  const [path, setPath] = useState<string>('');
  const [score, setScore] = useState<number>(0);
  const [time, setTime] = useState<number>(0);
  const [gameActive, setGameActive] = useState<boolean>(false);
  const [results, setResults] = useState<Array<{date: string, score: number, completionTime: number}>>([]);
  
  const dots = useRef<Array<{x: number, y: number}>>([]);
  const timer = useRef<NodeJS.Timeout>();
  const startTime = useRef<number>(0);

  // Generate spiral dots
  const generateDots = () => {
    // Estimate available width and height for the touchArea
    // Container padding is 20 on each side
    const containerPadding = 20;
    const touchAreaWidth = Dimensions.get('window').width - 2 * containerPadding;

    // Estimate vertical space taken by other elements when game is active:
    // Title (fontSize: 24, marginBottom: 20) -> ~44px
    // Status Text (Time/Score) -> ~22px
    // TouchArea marginVertical: 20 (top) + 20 (bottom) -> 40px
    // Container padding: 20 (top) + 20 (bottom) -> 40px
    const topClearance = containerPadding + 24 + 20 + 22 + 20; // approx 106px
    const bottomClearance = 20 + containerPadding; // approx 40px
    const touchAreaHeight = Dimensions.get('window').height - topClearance - bottomClearance;

    // Center of the touchArea
    const spiralCenterX = touchAreaWidth / 2;
    const spiralCenterY = touchAreaHeight / 2;

    const newDots = [];
    const numDots = 20;
    const baseRadius = 10; // Starting radius

    // Calculate max radius to fit within the touchArea
    const halfMinDim = Math.min(spiralCenterX, spiralCenterY);
    let maxAllowedRadius = halfMinDim * 0.90; // Use 90% of the smaller half-dimension

    // Ensure maxAllowedRadius is sensible and allows for growth
    if (maxAllowedRadius < baseRadius + (numDots - 1) * 2) { // Min increment of 2 for numDots-1 steps
      maxAllowedRadius = baseRadius + (numDots - 1) * 2;
      if (maxAllowedRadius > halfMinDim) maxAllowedRadius = halfMinDim; // Cap at the half dimension
    }

    const radiusIncrement = (numDots > 1 && maxAllowedRadius > baseRadius)
      ? (maxAllowedRadius - baseRadius) / (numDots - 1)
      : (numDots > 1 ? 2 : 0); // Fallback increment or 0 if single dot

    for (let i = 0; i < numDots; i++) {
      const angle = i * 0.4; // Slightly more turns for a better spiral visual
      const radius = baseRadius + i * radiusIncrement;
      newDots.push({
        x: spiralCenterX + radius * Math.cos(angle),
        y: spiralCenterY + radius * Math.sin(angle)
      });
    }
    dots.current = newDots;
    setPath('');
    setScore(0);
  };

  const startGame = () => {
    generateDots();
    setGameActive(true);
    setTime(0);
    startTime.current = Date.now();
    timer.current = setInterval(() => {
      setTime(prev => prev + 0.1);
    }, 100);
  };

  const endGame = () => {
    clearInterval(timer.current);
    setGameActive(false);
    const todayScore = Math.round(score * 100) / 100;
    const completionTimeValue = parseFloat(time.toFixed(1)); // Capture time taken
    setResults(prev => [{
      date: new Date().toLocaleDateString(),
      score: todayScore,
      completionTime: completionTimeValue
    }, ...prev.slice(0, 4)]);
    sendScoreToServer(todayScore, completionTimeValue);
  };

  const handleTouchMove = (e: any) => {
    if (!gameActive) return;
    
    const { locationX, locationY } = e.nativeEvent;
    const newPoint = `${path.length === 0 ? 'M' : 'L'}${locationX},${locationY} `;
    
    // Check proximity to dots
    dots.current.forEach((dot, index) => {
      const distance = Math.sqrt(
        Math.pow(locationX - dot.x, 2) + 
        Math.pow(locationY - dot.y, 2)
      );
      
      if (distance < 30) {
        setScore(prev => prev + (20 - index) * 0.1);
      }
    });
    
    setPath(prev => prev + newPoint);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Spiral Connection Game</Text>
      
      {!gameActive ? (
        <View style={styles.instructions}>
          <Text>Connect the dots in order without lifting your finger</Text>
          <TouchableOpacity style={styles.button} onPress={startGame}>
            <Text style={styles.buttonText}>Start</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.gameArea}>
          <Text>Time: {time.toFixed(1)}s | Score: {score.toFixed(1)}</Text>
          
          <View 
            style={styles.touchArea}
            onTouchMove={handleTouchMove}
            onTouchEnd={endGame}
          >
            <Svg height="100%" width="100%">
              <Path 
                d={path} 
                stroke="blue" 
                strokeWidth="3" 
                fill="none" 
              />
              
              {dots.current.map((dot, index) => (
                <Circle 
                  key={index}
                  cx={dot.x} 
                  cy={dot.y} 
                  r="8" 
                  fill={index % 2 === 0 ? "red" : "green"} 
                />
              ))}
            </Svg>
          </View>
        </View>
      )}
      
      {results.length > 0 && (
        <View style={styles.results}>
          <Text>Previous Scores:</Text>
          {results.map((result, i) => (
            <Text key={i}>{result.date}: Score {result.score.toFixed(1)}, Time {result.completionTime.toFixed(1)}s</Text>
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
  button: { 
    backgroundColor: '#3498db', 
    padding: 15, 
    borderRadius: 10,
    marginTop: 20
  },
  buttonText: { color: 'white', fontSize: 18 },
  gameArea: { flex: 1 },
  touchArea: { 
    flex: 1, 
    borderWidth: 1, 
    borderColor: '#ddd',
    marginVertical: 20
  },
  results: { marginTop: 20 }
});

export default ConnectDots;