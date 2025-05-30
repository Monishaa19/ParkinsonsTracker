import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  PanResponder,
  Dimensions,
  Alert,
  Platform,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { captureRef } from "react-native-view-shot";
import * as MediaLibrary from "expo-media-library";

type DrawingMode = "free" | "wave" | "spiral";

export default function WhiteboardScreen() {
  const [currentPath, setCurrentPath] = useState<string>("");
  const [drawingMode, setDrawingMode] = useState<DrawingMode>("free");
  const [waveTemplatePath, setWaveTemplatePath] = useState<string>("");
  const [spiralTemplatePath, setSpiralTemplatePath] = useState<string>("");
  const gestureContainerLayout = useRef({ width: 0, height: 0 });
  const viewToCaptureRef = useRef(null); // Ref for the view to capture

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (event) => {
        const { locationX, locationY } = event.nativeEvent;
        setCurrentPath(`M${locationX},${locationY}`);
      },
      onPanResponderMove: (event) => {
        const { locationX, locationY } = event.nativeEvent;
        setCurrentPath((prevPath) => `${prevPath} L${locationX},${locationY}`);
      },
      onPanResponderRelease: () => {
        // The currentPath will persist on screen until cleared or a new drawing starts.
        // No action needed here to make it persist if we are not storing an array of paths.
      },
    })
  ).current;

  const clearCanvas = () => {
    setCurrentPath("");
  };

  const handleModeChange = (mode: DrawingMode) => {
    setDrawingMode(mode);
    clearCanvas(); // Clear user's drawing when mode changes
  };

  useEffect(() => {
    // Generate template paths when component mounts or layout changes
    // This is a simplified generation. For perfect fitting, use onLayout of gestureContainer.
    const generateTemplates = (canvasWidth: number, canvasHeight: number) => {
      if (canvasWidth <= 0 || canvasHeight <= 0) return;

      // Generate Wave Path
      let wavePath = "";
      const waveAmplitude = canvasHeight / 6; // Amplitude relative to canvas height
      const waveCycles = 2.5;
      const startY = canvasHeight / 2;
      wavePath = `M 0, ${startY}`;
      for (let x = 1; x <= canvasWidth; x += 2) {
        // Increment for smoother curve
        const y =
          startY +
          waveAmplitude *
            Math.sin((waveCycles * 2 * Math.PI * x) / canvasWidth);
        wavePath += ` L ${x.toFixed(2)},${y.toFixed(2)}`;
      }
      setWaveTemplatePath(wavePath);

      // Generate Spiral Path
      let spiralPathData = "";
      const centerX = canvasWidth / 2;
      const centerY = canvasHeight / 2;
      const spiralTurns = 4;
      const maxRadius = Math.min(centerX, centerY) * 0.9; // Spiral fits within 90%
      const a = maxRadius / (spiralTurns * 2 * Math.PI); // Growth factor

      for (let theta = 0; theta <= spiralTurns * 2 * Math.PI; theta += 0.05) {
        // Increment for smoother spiral
        const r = a * theta;
        const x = centerX + r * Math.cos(theta);
        const y = centerY + r * Math.sin(theta);
        if (theta === 0) {
          spiralPathData = `M ${x.toFixed(2)},${y.toFixed(2)}`;
        } else {
          spiralPathData += ` L ${x.toFixed(2)},${y.toFixed(2)}`;
        }
      }
      setSpiralTemplatePath(spiralPathData);
    };

    if (
      gestureContainerLayout.current.width > 0 &&
      gestureContainerLayout.current.height > 0
    ) {
      generateTemplates(
        gestureContainerLayout.current.width,
        gestureContainerLayout.current.height
      );
    } else {
      // Fallback if onLayout hasn't fired or isn't used for initial setup
      const { width: screenWidth } = Dimensions.get("window");
      const approxCanvasWidth = screenWidth - 40; // padding of whiteboardContainer
      const approxCanvasHeight = 300; // Estimate, as gestureContainer is flex:1
      generateTemplates(approxCanvasWidth, approxCanvasHeight);
    }
  }, [
    gestureContainerLayout.current.width,
    gestureContainerLayout.current.height,
  ]); // Re-generate if layout dimensions change

  const handleSaveDrawing = async () => {
    if (!viewToCaptureRef.current) {
      Alert.alert("Error", "Cannot capture drawing. Please try again.");
      return;
    }

    try {
      // Step 1: Capture the drawing as an image
      const uri = await captureRef(viewToCaptureRef, {
        format: "png",
        quality: 0.9,
      });

      // Convert the image to a blob
      const response = await fetch(uri);
      const blob = await response.blob();

      // Step 2: Send the image to the first backend (process-image)
      const formData = new FormData();
      formData.append("image", {
        uri,
        name: "drawing.png",
        type: "image/png",
      });

      const processImageResponse = await fetch(
        "http://172.16.234.78:5000/process-image",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!processImageResponse.ok) {
        throw new Error("Failed to process the image.");
      }

      const pointsData = await processImageResponse.json();

      // Step 3: Send the points to the second backend (extract-features)
      const extractFeaturesResponse = await fetch(
        "http://172.16.234.78:5001/extract-features",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(pointsData),
        }
      );

      if (!extractFeaturesResponse.ok) {
        throw new Error("Failed to extract features.");
      }

      const featuresData = await extractFeaturesResponse.json();

       console.log("Response from app2.py:", featuresData);
 
      // Step 4: Send the features to the third backend (predict-smoothness)
      const predictSmoothnessResponse = await fetch(
        "http://172.16.234.78:5002/predict-smoothness",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(featuresData),
        }
      );

      if (!predictSmoothnessResponse.ok) {
        throw new Error("Failed to predict smoothness.");
      }

      const smoothnessData = await predictSmoothnessResponse.json();

      // console.log("Response from app3.py:", smoothnessData);

      // Step 5: Display the smoothness score
     
      
      // Save the drawing to the gallery
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Storage permission is required to save the drawing."
        );
        return;
      }

      // setTimeout(() => {
      //   Alert.alert(
      //     "Saved!",
      //     "Your drawing has been saved to your photo gallery."
      //   );
      // }, 1000);

      await MediaLibrary.saveToLibraryAsync(uri);
      Alert.alert(
        "Smootheness Index",
        `The smoothness of your drawing is: ${smoothnessData.smoothness}`
      );
    } catch (error) {
      console.error("Error:", error);
      Alert.alert(
        "Error",
        error.message || "An error occurred while saving the drawing."
      );
    }
  };

  return (
    <View style={styles.whiteboardContainer}>
      <View style={styles.canvasHeader}>
        <Text style={styles.canvasTitle}>Drawing Canvas</Text>
        <TouchableOpacity onPress={clearCanvas} style={styles.clearButton}>
          <Text style={styles.clearButtonText}>Clear Canvas</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.modeSelectorContainer}>
        {(["free", "wave", "spiral"] as DrawingMode[]).map((mode) => (
          <TouchableOpacity
            key={mode}
            onPress={() => handleModeChange(mode)}
            style={[
              styles.modeButton,
              drawingMode === mode && styles.activeModeButton,
            ]}
          >
            <Text
              style={[
                styles.modeButtonText,
                drawingMode === mode && styles.activeModeButtonText,
              ]}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View
        ref={viewToCaptureRef} // Assign ref here
        style={styles.gestureContainer}
        {...panResponder.panHandlers}
        onLayout={(event) => {
          const { width, height } = event.nativeEvent.layout;
          if (
            width !== gestureContainerLayout.current.width ||
            height !== gestureContainerLayout.current.height
          ) {
            gestureContainerLayout.current = { width, height };
            // Trigger re-render or re-calculation if needed, useEffect dependency will handle it
          }
        }}
      >
        <Svg height="100%" width="100%" style={styles.canvas}>
          {/* Template Paths */}
          {drawingMode === "wave" && waveTemplatePath ? (
            <Path
              d={waveTemplatePath}
              stroke="lightgray"
              strokeWidth={1.5}
              fill="none"
              strokeDasharray="4,4"
            />
          ) : null}
          {drawingMode === "spiral" && spiralTemplatePath ? (
            <Path
              d={spiralTemplatePath}
              stroke="lightgray"
              strokeWidth={1.5}
              fill="none"
              strokeDasharray="4,4"
            />
          ) : null}

          {/* Current User Drawing */}
          {currentPath ? (
            <Path
              d={currentPath}
              stroke="black"
              strokeWidth={2.5}
              fill="none"
            />
          ) : null}
        </Svg>
      </View>
      <View style={styles.controlsContainer}>
        <TouchableOpacity onPress={handleSaveDrawing} style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save Drawing</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  whiteboardContainer: {
    flex: 1,
    padding: 20,
  },
  canvasHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  canvasTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  clearButton: {
    backgroundColor: "#e74c3c",
    padding: 10,
    borderRadius: 8,
  },
  clearButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  modeSelectorContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 15,
  },
  modeButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#3498db",
  },
  activeModeButton: {
    backgroundColor: "#3498db",
  },
  modeButtonText: {
    color: "#3498db",
    fontWeight: "500",
    fontSize: 13,
  },
  activeModeButtonText: {
    color: "white",
  },
  gestureContainer: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 8,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  canvas: {
    flex: 1,
    backgroundColor: "#fff",
  },
  controlsContainer: {
    marginTop: 15,
    alignItems: "center",
  },
  saveButton: {
    backgroundColor: "#27ae60", // A green color for save
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 10,
  },
  saveButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
