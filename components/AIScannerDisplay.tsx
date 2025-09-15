import React, { useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  Animated,
  useWindowDimensions,
} from "react-native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";

interface AIScannerDisplayProps {
  isScanning: boolean;
  progress: number;
  currentTarget: string;
  isEnabled: boolean;
}

export function AIScannerDisplay({ 
  isScanning, 
  progress, 
  currentTarget, 
  isEnabled 
}: AIScannerDisplayProps) {
  const { width } = useWindowDimensions();
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isEnabled && isScanning) {
      // Pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Rotation animation
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        })
      ).start();

      // Glow animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: false,
          }),
        ])
      ).start();

      // Scan line animation
      Animated.loop(
        Animated.timing(scanLineAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        })
      ).start();
    } else {
      pulseAnim.setValue(0);
      rotateAnim.setValue(0);
      glowAnim.setValue(0);
      scanLineAnim.setValue(0);
    }
  }, [isEnabled, isScanning, pulseAnim, rotateAnim, glowAnim, scanLineAnim]);

  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.1],
  });

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  const scanLineTranslateX = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-width, width],
  });

  if (!isEnabled) {
    return (
      <View style={styles.container}>
        <View style={styles.inactiveContainer}>
          <MaterialIcons name="psychology" color="#6B7280" size={48} />
          <Text style={styles.inactiveTitle}>AI Scanner Offline</Text>
          <Text style={styles.inactiveSubtitle}>Enable AI Trading to start scanning</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.scannerContainer}>
        {/* Outer glow ring */}
        <Animated.View 
          style={[
            styles.glowRing,
            {
              opacity: glowOpacity,
              transform: [{ scale: pulseScale }],
            }
          ]} 
        />
        
        {/* Main scanner circle */}
        <View style={styles.scannerCircle}>
          {/* Rotating border */}
          <Animated.View 
            style={[
              styles.rotatingBorder,
              { transform: [{ rotate: rotation }] }
            ]}
          >
            <View style={styles.borderSegment} />
            <View style={[styles.borderSegment, { transform: [{ rotate: '120deg' }] }]} />
            <View style={[styles.borderSegment, { transform: [{ rotate: '240deg' }] }]} />
          </Animated.View>
          
          {/* Center brain icon */}
          <Animated.View 
            style={[
              styles.centerIcon,
              { transform: [{ scale: pulseScale }] }
            ]}
          >
            <MaterialIcons name="psychology" color="#00D4AA" size={32} />
          </Animated.View>
          
          {/* Activity indicators */}
          <View style={styles.activityIndicators}>
            <View style={[styles.indicator, styles.indicator1]}>
              <Ionicons name="flash" color="#00D4AA" size={16} />
            </View>
            <View style={[styles.indicator, styles.indicator2]}>
              <MaterialIcons name="gps-fixed" color="#00D4AA" size={16} />
            </View>
            <View style={[styles.indicator, styles.indicator3]}>
              <MaterialIcons name="show-chart" color="#00D4AA" size={16} />
            </View>
          </View>
        </View>
        
        {/* Scan line effect */}
        {isScanning && (
          <Animated.View 
            style={[
              styles.scanLine,
              { transform: [{ translateX: scanLineTranslateX }] }
            ]}
          />
        )}
      </View>
      
      {/* Status display */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusTitle}>
          {isScanning ? '🔍 AI Scanner Active' : '⚡ AI Ready'}
        </Text>
        
        {isScanning && (
          <>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill,
                    { width: `${progress}%` }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>{progress.toFixed(0)}%</Text>
            </View>
            
            {currentTarget && (
              <Text style={styles.targetText}>{currentTarget}</Text>
            )}
          </>
        )}
        
        {!isScanning && (
          <Text style={styles.readyText}>
            Monitoring market for profitable opportunities...
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1F2937",
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    alignItems: "center",
  },
  inactiveContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  inactiveTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#6B7280",
    marginTop: 12,
  },
  inactiveSubtitle: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 4,
  },
  scannerContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  glowRing: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#00D4AA",
    opacity: 0.2,
  },
  scannerCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#111827",
    borderWidth: 2,
    borderColor: "#374151",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  rotatingBorder: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  borderSegment: {
    position: "absolute",
    width: 4,
    height: 20,
    backgroundColor: "#00D4AA",
    borderRadius: 2,
    top: -2,
    left: 58,
  },
  centerIcon: {
    zIndex: 2,
  },
  activityIndicators: {
    position: "absolute",
    width: 120,
    height: 120,
  },
  indicator: {
    position: "absolute",
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#1F2937",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#00D4AA",
  },
  indicator1: {
    top: 10,
    right: 20,
  },
  indicator2: {
    bottom: 10,
    left: 20,
  },
  indicator3: {
    top: 48,
    left: -12,
  },
  scanLine: {
    position: "absolute",
    width: 2,
    height: 120,
    backgroundColor: "#00D4AA",
    opacity: 0.6,
  },
  statusContainer: {
    alignItems: "center",
    width: "100%",
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 12,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 8,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: "#374151",
    borderRadius: 3,
    marginRight: 12,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#00D4AA",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#00D4AA",
    minWidth: 40,
  },
  targetText: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    marginTop: 4,
  },
  readyText: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
  },
});