import React, { useRef, useState } from 'react';
import {
  View,
  PanResponder,
  Dimensions,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

const sendScoreToServer = async (score: number) => {
  try {
    await fetch('/jitteryLine', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ score}),
    });
  } catch (err) {
    console.error('Failed to send score:', err);
  }
};

const LineJitter = () => {
  const [points, setPoints] = useState<{ x: number; y: number }[]>([]);
  const [jitterScore, setJitterScore] = useState<number | null>(null);
  // const pathRef = useRef(''); // This ref was unused

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (event, gestureState) => {
        // Use locationX and locationY from nativeEvent for coordinates relative to the pan responder's view
        const { locationX, locationY } = event.nativeEvent;
        const newPoint = { x: locationX, y: locationY };
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
    sendScoreToServer(normalizedScore);
  };

  const clearCanvas = () => {
    setPoints([]);
    setJitterScore(null);
  };

  const pathData = generatePath();

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Please draw a line</Text>
      <View style={styles.canvas} {...panResponder.panHandlers}>
        <Svg height="100%" width="100%">
          <Path
            d={pathData}
            stroke="#3498db" // A nice blue color for the line
            strokeWidth={3}
            fill="none"
          />
        </Svg>
      </View>

      <View style={styles.controls}>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.scoreButton]}
            onPress={calculateJitterScore}
          >
            <Text style={styles.buttonText}>Give Score</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.clearButton]}
            onPress={clearCanvas}
          >
            <Text style={styles.buttonText}>Clear Screen</Text>
          </TouchableOpacity>
        </View>
        {jitterScore !== null && (
          <Text style={styles.scoreText}>Jitter Score: {jitterScore.toFixed(2)}</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0', // Light gray background for the whole screen
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#2c3e50', // Dark blue/gray
  },
  canvas: {
    flex: 1,
    backgroundColor: '#ffffff', // White canvas
    marginHorizontal: 10, // Add some horizontal margin
    borderRadius: 8, // Rounded corners for the canvas
    overflow: 'hidden', // Ensure SVG respects border radius
    borderWidth: 1,
    borderColor: '#dddddd', // Light border for the canvas
  },
  controls: {
    padding: 16,
    paddingBottom: 100, // More space at the bottom
    backgroundColor: '#f8f9fa', // Slightly off-white for controls area
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    // Items will now be stacked vertically by default (column)
    alignItems: 'center', // Center items horizontally in the column
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%', // Make the button row take full width
    marginBottom: 15, // Add space between button row and score text
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 120, // Give buttons a minimum width
    alignItems: 'center', // Center text in button
  },
  scoreButton: {
    backgroundColor: '#27ae60', // Green for score
  },
  clearButton: {
    backgroundColor: '#e74c3c', // Red for clear
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  scoreText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center', // Center the score text
    // No longer need width: '100%' as it's a direct child of a column-direction flex container
    // marginTop is handled by marginBottom on buttonRow or padding on controls
  },
});

export default LineJitter;
