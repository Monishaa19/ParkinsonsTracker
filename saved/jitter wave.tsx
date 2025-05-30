import React, { useRef, useState } from 'react';
import {
  View,
  PanResponder,
  Dimensions,
  Button,
  Text,
  StyleSheet,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

const TraceTheShape = () => {
  const [points, setPoints] = useState<{ x: number; y: number }[]>([]);
  const [jitterScore, setJitterScore] = useState<number | null>(null);
  const pathRef = useRef('');

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (e, gestureState) => {
        const newPoint = { x: gestureState.moveX, y: gestureState.moveY };
        setPoints((prev) => [...prev, newPoint]);
      },
    })
  ).current;

  const generatePath = () => {
    if (points.length === 0) return '';
    return points.reduce((path, point, index) => {
      return index === 0
        ? `M ${point.x} ${point.y}`
        : `${path} L ${point.x} ${point.y}`;
    }, '');
  };

  const calculateJitterScore = () => {
    if (points.length === 0) {
      setJitterScore(null);
      return;
    }

    const meanY = points.reduce((sum, p) => sum + p.y, 0) / points.length;
    const varianceY =
      points.reduce((sum, p) => sum + Math.pow(p.y - meanY, 2), 0) /
      points.length;
    const stdY = Math.sqrt(varianceY);

    const normalizedScore = Math.min(10, parseFloat((stdY / 10).toFixed(2)));
    setJitterScore(normalizedScore);
  };

  const clearCanvas = () => {
    setPoints([]);
    setJitterScore(null);
  };

  const pathData = generatePath();

  return (
    <View style={styles.container}>
      <View style={styles.canvas} {...panResponder.panHandlers}>
        <Svg height={height} width={width}>
          <Path
            d={pathData}
            stroke="black"
            strokeWidth={3}
            fill="none"
          />
        </Svg>
      </View>

      <View style={styles.controls}>
        <Button title="Give Score" onPress={calculateJitterScore} />
        <Button title="Clear Screen" onPress={clearCanvas} color="red" />
        {jitterScore !== null && (
          <Text style={styles.scoreText}>Jitter Score: {jitterScore}</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  canvas: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  controls: {
    padding: 16,
    backgroundColor: '#ffffff',
  },
  scoreText: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default TraceTheShape;
