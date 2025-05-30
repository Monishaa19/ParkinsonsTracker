// import React, { useState, useRef, useEffect } from "react";
// import {
//   StyleSheet,
//   View,
//   Text,
//   TouchableOpacity,
//   PanResponder,
//   Dimensions,
//   Alert,
//   Platform,
//   ScrollView,
//   Button
// } from "react-native";
// import Svg, { Path } from "react-native-svg";
// import { captureRef } from "react-native-view-shot";
// import * as MediaLibrary from "expo-media-library";
// import useWebSocket from "react-use-websocket";
// import { db } from '../../firebase';  // Your Firebase config

// import { collection, addDoc, serverTimestamp, query, where, getDocs, orderBy, limit } from "firebase/firestore";

// type DrawingMode = "free" | "wave" | "spiral";

// type SensorReading = {
//   tremor: number;
//   rotation: number;
//   strength: number;
//   stability: number;
//   timestamp: any;
//   deviceTime?: number;
// };

// type SessionEvent = {
//   action: 'start' | 'stop';
//   timestamp: any;
// };

// export default function CombinedScreen() {
//   // Whiteboard states
//   const [currentPath, setCurrentPath] = useState<string>("");
//   const [drawingMode, setDrawingMode] = useState<DrawingMode>("free");
//   const [waveTemplatePath, setWaveTemplatePath] = useState<string>("");
//   const [spiralTemplatePath, setSpiralTemplatePath] = useState<string>("");
//   const gestureContainerLayout = useRef({ width: 0, height: 0 });
//   const viewToCaptureRef = useRef(null);

//   // Sensor states
//   const [tremor, setTremor] = useState<number>(0);
//   const [rotation, setRotation] = useState<number>(0);
//   const [isSessionActive, setIsSessionActive] = useState<boolean>(false);
//   const [avgTremor, setAvgTremor] = useState<number | null>(null);
//   const [avgRotation, setAvgRotation] = useState<number | null>(null);
//   const [connectionStatus, setConnectionStatus] = useState<string>('Disconnected');
//   const [mlValue, setMlPrediction] = useState<string | null>(null);

//   // WebSocket connection
//   const { sendMessage, lastMessage } = useWebSocket(
//     'ws://192.168.84.184:81',
//     {
//       onOpen: () => setConnectionStatus('Connected'),
//       onClose: () => setConnectionStatus('Disconnected'),
//       onError: (error) => {
//         setConnectionStatus('Error');
//         console.error('WebSocket error:', error);
//       },
//       shouldReconnect: () => true,
//       reconnectAttempts: 10,
//       reconnectInterval: 3000,
//     }
//   );

//   // Whiteboard PanResponder
//   const panResponder = useRef(
//     PanResponder.create({
//       onStartShouldSetPanResponder: () => true,
//       onMoveShouldSetPanResponder: () => true,
//       onPanResponderGrant: (event) => {
//         const { locationX, locationY } = event.nativeEvent;
//         setCurrentPath(`M${locationX},${locationY}`);
//       },
//       onPanResponderMove: (event) => {
//         const { locationX, locationY } = event.nativeEvent;
//         setCurrentPath((prevPath) => `${prevPath} L${locationX},${locationY}`);
//       },
//       onPanResponderRelease: () => {},
//     })
//   ).current;

//   // Clear canvas function
//   const clearCanvas = () => {
//     setCurrentPath("");
//   };

//   // Handle drawing mode change
//   const handleModeChange = (mode: DrawingMode) => {
//     setDrawingMode(mode);
//     clearCanvas();
//   };

//   // Generate template paths
//   useEffect(() => {
//     const generateTemplates = (canvasWidth: number, canvasHeight: number) => {
//       if (canvasWidth <= 0 || canvasHeight <= 0) return;

//       // Generate Wave Path
//       let wavePath = "";
//       const waveAmplitude = canvasHeight / 6;
//       const waveCycles = 2.5;
//       const startY = canvasHeight / 2;
//       wavePath = `M 0, ${startY}`;
//       for (let x = 1; x <= canvasWidth; x += 2) {
//         const y =
//           startY +
//           waveAmplitude *
//             Math.sin((waveCycles * 2 * Math.PI * x) / canvasWidth);
//         wavePath += ` L ${x.toFixed(2)},${y.toFixed(2)}`;
//       }
//       setWaveTemplatePath(wavePath);

//       // Generate Spiral Path
//       let spiralPathData = "";
//       const centerX = canvasWidth / 2;
//       const centerY = canvasHeight / 2;
//       const spiralTurns = 4;
//       const maxRadius = Math.min(centerX, centerY) * 0.9;
//       const a = maxRadius / (spiralTurns * 2 * Math.PI);

//       for (let theta = 0; theta <= spiralTurns * 2 * Math.PI; theta += 0.05) {
//         const r = a * theta;
//         const x = centerX + r * Math.cos(theta);
//         const y = centerY + r * Math.sin(theta);
//         if (theta === 0) {
//           spiralPathData = `M ${x.toFixed(2)},${y.toFixed(2)}`;
//         } else {
//           spiralPathData += ` L ${x.toFixed(2)},${y.toFixed(2)}`;
//         }
//       }
//       setSpiralTemplatePath(spiralPathData);
//     };

//     if (
//       gestureContainerLayout.current.width > 0 &&
//       gestureContainerLayout.current.height > 0
//     ) {
//       generateTemplates(
//         gestureContainerLayout.current.width,
//         gestureContainerLayout.current.height
//       );
//     } else {
//       const { width: screenWidth } = Dimensions.get("window");
//       const approxCanvasWidth = screenWidth - 40;
//       const approxCanvasHeight = 300;
//       generateTemplates(approxCanvasWidth, approxCanvasHeight);
//     }
//   }, [
//     gestureContainerLayout.current.width,
//     gestureContainerLayout.current.height,
//   ]);

// useEffect(() => {
//   if (lastMessage && isSessionActive) {
//     try {
//       // Check if the data starts with { or [
//       if (
//         typeof lastMessage.data === 'string' &&
//         (lastMessage.data.trim().startsWith('{') ||
//          lastMessage.data.trim().startsWith('['))
//       ) {
//         const data = JSON.parse(lastMessage.data);

//         if (
//           typeof data.tremor === 'number' &&
//           typeof data.angle === 'number' &&
//           typeof data.strength === 'number' &&
//           typeof data.stability === 'number'
//         ) {
//           setTremor(data.tremor);
//           setRotation(data.angle);

//           // Save to Firestore
//           addDoc(collection(db, 'sensorReadings'), {
//             tremor: data.tremor,
//             rotation: data.angle,
//             strength: data.strength,
//             stability: data.stability,
//             deviceTime: data.time,
//             timestamp: serverTimestamp(),
//           } as SensorReading).catch((err) =>
//             console.error('Error saving sensor reading:', err)
//           );
//         }
//       } else {
//         console.warn('Ignored non-JSON message:', lastMessage.data);
//       }
//     } catch (error) {
//       console.error('Invalid JSON data received:', error);
//     }
//   }
// }, [lastMessage, isSessionActive]);


//   // Handle save drawing
//   const handleSaveDrawing = async () => {
//     if (!viewToCaptureRef.current) {
//       Alert.alert("Error", "Cannot capture drawing. Please try again.");
//       return;
//     }

//     try {
//       const uri = await captureRef(viewToCaptureRef, {
//         format: "png",
//         quality: 0.9,
//       });

//       const response = await fetch(uri);
//       const blob = await response.blob();

//       const formData = new FormData();
//       formData.append("image", {
//         uri,
//         name: "drawing.png",
//         type: "image/png",
//       }as any);

//       const processImageResponse = await fetch(
//         "http://172.16.234.78:5000/process-image",
//         {
//           method: "POST",
//           body: formData,
//         }
//       );

//       if (!processImageResponse.ok) {
//         throw new Error("Failed to process the image.");
//       }

//       const pointsData = await processImageResponse.json();

//       const extractFeaturesResponse = await fetch(
//         "http://172.16.234.78:5001/extract-features",
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify(pointsData),
//         }
//       );

//       if (!extractFeaturesResponse.ok) {
//         throw new Error("Failed to extract features.");
//       }

//       const featuresData = await extractFeaturesResponse.json();

//       const predictSmoothnessResponse = await fetch(
//         "http://172.16.234.78:5002/predict-smoothness",
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify(featuresData),
//         }
//       );

//       if (!predictSmoothnessResponse.ok) {
//         throw new Error("Failed to predict smoothness.");
//       }

//       const smoothnessData = await predictSmoothnessResponse.json();

//       const { status } = await MediaLibrary.requestPermissionsAsync();
//       if (status !== "granted") {
//         Alert.alert(
//           "Permission Denied",
//           "Storage permission is required to save the drawing."
//         );
//         return;
//       }

//       await MediaLibrary.saveToLibraryAsync(uri);
//       Alert.alert(
//         "Smootheness Index",
//         `The smoothness of your drawing is: ${smoothnessData.smoothness}`
//       );
//     } catch (error: unknown) {
//   if (error instanceof Error) {
//     Alert.alert(
//       "Error",
//       error.message || "An error occurred while saving the drawing."
//     );
//   } else {
//     Alert.alert(
//       "Error",
//       "An unknown error occurred while saving the drawing."
//     );
//   }
// }

//   };

//   // Sensor session handlers
//   const handleStart = async () => {
//     try {
//       sendMessage('start');
//       setIsSessionActive(true);
//       setAvgTremor(null);
//       setAvgRotation(null);

//       await addDoc(collection(db, 'sessions'), {
//         action: 'start',
//         timestamp: serverTimestamp(),
//       } as SessionEvent);

//       Alert.alert('Session started');
//     } catch (error) {
//       console.error('Error starting session:', error);
//       Alert.alert('Error starting session');
//     }
//   };

//   const handleStop = async () => {
//     try {
//       sendMessage('stop');
//       setIsSessionActive(false);

//       await addDoc(collection(db, 'sessions'), {
//         action: 'stop',
//         timestamp: serverTimestamp(),
//       } as SessionEvent);

//       const averages = await calculateAverages();
//       setAvgTremor(averages.tremorAvg);
//       setAvgRotation(averages.rotationAvg);

//       await addDoc(collection(db, 'sessionAverages'), {
//         tremor_avg: averages.tremorAvg,
//         rotation_avg: averages.rotationAvg,
//         strength_avg: averages.strengthAvg,
//         stability_avg: averages.stabilityAvg,
//         timestamp: serverTimestamp(),
//       });

//       Alert.alert(
//         'Session complete',
//         `Avg Tremor: ${averages.tremorAvg.toFixed(2)} Hz\nAvg Rotation: ${averages.rotationAvg.toFixed(4)}°\nAvg Strength: ${averages.strengthAvg.toFixed(2)}\nAvg Stability: ${averages.stabilityAvg.toFixed(2)}`
//       );
//     } catch (error) {
//       console.error('Error stopping session:', error);
//       Alert.alert('Error stopping session');
//     }
//   };

//   const calculateAverages = async () => {
//     try {
//       const sessionsQuery = query(
//         collection(db, 'sessions'),
//         orderBy('timestamp', 'desc'),
//         limit(2)
//       );

//       const sessionsSnapshot = await getDocs(sessionsQuery);

//       if (sessionsSnapshot.size < 2) {
//         return { tremorAvg: 0, rotationAvg: 0, strengthAvg: 0, stabilityAvg: 0 };
//       }

//       const stopSession = sessionsSnapshot.docs[0].data() as SessionEvent;
//       const startSession = sessionsSnapshot.docs[1].data() as SessionEvent;

//       if (
//         startSession.action !== 'start' ||
//         stopSession.action !== 'stop' ||
//         !startSession.timestamp ||
//         !stopSession.timestamp
//       ) {
//         return { tremorAvg: 0, rotationAvg: 0, strengthAvg: 0, stabilityAvg: 0 };
//       }

//       const readingsQuery = query(
//         collection(db, 'sensorReadings'),
//         where('timestamp', '>=', startSession.timestamp),
//         where('timestamp', '<=', stopSession.timestamp)
//       );

//       const readingsSnapshot = await getDocs(readingsQuery);

//       if (readingsSnapshot.empty) {
//         return { tremorAvg: 0, rotationAvg: 0, strengthAvg: 0, stabilityAvg: 0 };
//       }

//       let tremorSum = 0;
//       let rotationSum = 0;
//       let strengthSum = 0;
//       let stabilitySum = 0;
//       let count = 0;

//       readingsSnapshot.forEach((doc) => {
//         const reading = doc.data() as SensorReading;
//         tremorSum += reading.tremor;
//         rotationSum += reading.rotation;
//         strengthSum += reading.strength;
//         stabilitySum += reading.stability;
//         count++;
//       });

//       return {
//         tremorAvg: tremorSum / count,
//         rotationAvg: rotationSum / count,
//         strengthAvg: strengthSum / count,
//         stabilityAvg: stabilitySum / count,
//       };
//     } catch (error) {
//       console.error('Error calculating averages:', error);
//       return { tremorAvg: 0, rotationAvg: 0, strengthAvg: 0, stabilityAvg: 0 };
//     }
//   };

//   const fetchLatestSessionAverage = async () => {
//     try {
//       const q = query(
//         collection(db, 'sessionAverages'),
//         orderBy('timestamp', 'desc'),
//         limit(1)
//       );

//       const snapshot = await getDocs(q);

//       if (!snapshot.empty) {
//         const data = snapshot.docs[0].data();

//         return {
//           tremor_avg: data.tremor_avg,
//           rotation_avg: data.rotation_avg,
//           strength_avg: data.strength_avg,
//           stability_avg: data.stability_avg,
//         };
//       } else {
//         console.warn('No session averages found.');
//         return null;
//       }
//     } catch (error) {
//       console.error('Error fetching session average:', error);
//       return null;
//     }
//   };

//   const sendToMLModel = async () => {
//     const avgData = await fetchLatestSessionAverage();

//     if (!avgData) return;

//     try {
//       const response = await fetch('https://parkinsons-1-bzhp.onrender.com/predict', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           features: [
//             avgData.tremor_avg,
//             avgData.rotation_avg,
//             avgData.strength_avg,
//             avgData.stability_avg
//           ]
//         })
//       });

//       const result = await response.json();
//       console.log('ML prediction result:', result);

//       setMlPrediction(result.prediction.toFixed(5));
//       await addDoc(collection(db, 'mlPredictions'), {
//         prediction: parseFloat(result.prediction.toFixed(5)),
//         timestamp: serverTimestamp(),
//       });

//     } catch (error) {
//       console.error('Error sending data to ML model:', error);
//       setMlPrediction('Error getting prediction');
//     }
//   };

//   return (
//     <ScrollView style={styles.container}>
//       {/* Whiteboard Section */}
//       <View style={styles.whiteboardContainer}>
//         <View style={styles.canvasHeader}>
//           <Text style={styles.canvasTitle}>Drawing Canvas</Text>
//           <TouchableOpacity onPress={clearCanvas} style={styles.clearButton}>
//             <Text style={styles.clearButtonText}>Clear Canvas</Text>
//           </TouchableOpacity>
//         </View>
//         <View style={styles.modeSelectorContainer}>
//           {(["free", "wave", "spiral"] as DrawingMode[]).map((mode) => (
//             <TouchableOpacity
//               key={mode}
//               onPress={() => handleModeChange(mode)}
//               style={[
//                 styles.modeButton,
//                 drawingMode === mode && styles.activeModeButton,
//               ]}
//             >
//               <Text
//                 style={[
//                   styles.modeButtonText,
//                   drawingMode === mode && styles.activeModeButtonText,
//                 ]}
//               >
//                 {mode.charAt(0).toUpperCase() + mode.slice(1)}
//               </Text>
//             </TouchableOpacity>
//           ))}
//         </View>
//         <View
//           ref={viewToCaptureRef}
//           style={styles.gestureContainer}
//           {...panResponder.panHandlers}
//           onLayout={(event) => {
//             const { width, height } = event.nativeEvent.layout;
//             if (
//               width !== gestureContainerLayout.current.width ||
//               height !== gestureContainerLayout.current.height
//             ) {
//               gestureContainerLayout.current = { width, height };
//             }
//           }}
//         >
//           <Svg height="100%" width="100%" style={styles.canvas}>
//             {drawingMode === "wave" && waveTemplatePath ? (
//               <Path
//                 d={waveTemplatePath}
//                 stroke="lightgray"
//                 strokeWidth={1.5}
//                 fill="none"
//                 strokeDasharray="4,4"
//               />
//             ) : null}
//             {drawingMode === "spiral" && spiralTemplatePath ? (
//               <Path
//                 d={spiralTemplatePath}
//                 stroke="lightgray"
//                 strokeWidth={1.5}
//                 fill="none"
//                 strokeDasharray="4,4"
//               />
//             ) : null}
//             {currentPath ? (
//               <Path
//                 d={currentPath}
//                 stroke="black"
//                 strokeWidth={2.5}
//                 fill="none"
//               />
//             ) : null}
//           </Svg>
//         </View>
//         <View style={styles.controlsContainer}>
//           <TouchableOpacity onPress={handleSaveDrawing} style={styles.saveButton}>
//             <Text style={styles.saveButtonText}>Save Drawing</Text>
//           </TouchableOpacity>
//         </View>
//       </View>

//       {/* Sensor Controls Section */}
//       <View style={styles.sensorContainer}>
//         <Text style={styles.sensorTitle}>Sensor Controls</Text>
        
//         <View style={styles.sensorStatusContainer}>
//           <Text style={styles.sensorStatusLabel}>WebSocket Status:</Text>
//           <Text
//             style={[
//               styles.sensorStatusValue,
//               connectionStatus === 'Connected' ? styles.connected : styles.disconnected,
//             ]}
//           >
//             {connectionStatus}
//           </Text>
//         </View>

//         <View style={styles.sensorButtonContainer}>
//           <View style={styles.sensorButtonWrapper}>
//             <Button
//               title="Start Session"
//               onPress={handleStart}
//               disabled={isSessionActive}
//               color="#4CAF50"
//             />
//           </View>
//           <View style={styles.sensorButtonWrapper}>
//             <Button
//               title="Stop Session"
//               onPress={handleStop}
//               disabled={!isSessionActive}
//               color="#F44336"
//             />
//           </View>
//         </View>

//         <View style={styles.sensorButtonWrapper}>
//           <Button
//             title="Get Score"
//             onPress={sendToMLModel}
//             color="#2196F3"
//           />
//         </View>

//         {mlValue !== null && (
//           <View style={styles.predictionBox}>
//             <Text style={styles.predictionLabel}>ML Prediction:</Text>
//             <Text style={styles.predictionValue}>{mlValue}</Text>
//           </View>
//         )}
//       </View>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f8f9fa',
//   },
//   whiteboardContainer: {
//     padding: 20,
//   },
//   canvasHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 20,
//   },
//   canvasTitle: {
//     fontSize: 22,
//     fontWeight: "bold",
//     color: "#2c3e50",
//   },
//   clearButton: {
//     backgroundColor: "#e74c3c",
//     padding: 10,
//     borderRadius: 8,
//   },
//   clearButtonText: {
//     color: "white",
//     fontWeight: "bold",
//   },
//   modeSelectorContainer: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//     marginBottom: 15,
//   },
//   modeButton: {
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//     borderRadius: 6,
//     borderWidth: 1,
//     borderColor: "#3498db",
//   },
//   activeModeButton: {
//     backgroundColor: "#3498db",
//   },
//   modeButtonText: {
//     color: "#3498db",
//     fontWeight: "500",
//     fontSize: 13,
//   },
//   activeModeButtonText: {
//     color: "white",
//   },
//   gestureContainer: {
//     height: 300,
//     backgroundColor: "white",
//     borderRadius: 8,
//     overflow: "hidden",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   canvas: {
//     flex: 1,
//     backgroundColor: "#fff",
//   },
//   controlsContainer: {
//     marginTop: 15,
//     alignItems: "center",
//   },
//   saveButton: {
//     backgroundColor: "#27ae60",
//     paddingVertical: 12,
//     paddingHorizontal: 20,
//     borderRadius: 8,
//     marginBottom: 10,
//   },
//   saveButtonText: {
//     color: "white",
//     fontWeight: "bold",
//     fontSize: 16,
//   },
//   // Sensor controls styles
//   sensorContainer: {
//     padding: 20,
//     marginTop: 10,
//     backgroundColor: '#fff',
//     borderRadius: 10,
//     marginHorizontal: 20,
//     marginBottom: 20,
//   },
//   sensorTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     marginBottom: 15,
//     color: '#2c3e50',
//     textAlign: 'center',
//   },
//   sensorStatusContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 15,
//     padding: 10,
//     borderRadius: 5,
//     backgroundColor: '#f8f9fa',
//   },
//   sensorStatusLabel: {
//     fontSize: 16,
//     marginRight: 10,
//     color: '#555',
//     fontWeight: '500',
//   },
//   sensorStatusValue: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     paddingHorizontal: 10,
//     paddingVertical: 5,
//     borderRadius: 5,
//   },
//   connected: {
//     backgroundColor: '#d4edda',
//     color: '#155724',
//   },
//   disconnected: {
//     backgroundColor: '#f8d7da',
//     color: '#721c24',
//   },
//   sensorButtonContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     marginVertical: 15,
//   },
//   sensorButtonWrapper: {
//     marginVertical: 10,
//     borderRadius: 5,
//     overflow: 'hidden',
//   },
//   predictionBox: {
//     marginTop: 20,
//     padding: 15,
//     backgroundColor: '#E3F2FD',
//     borderRadius: 8,
//     elevation: 2,
//   },
//   predictionLabel: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#0D47A1',
//   },
//   predictionValue: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#1565C0',
//     marginTop: 5,
//   },
// });