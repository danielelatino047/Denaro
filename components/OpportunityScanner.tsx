import React, { useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  Animated,
} from "react-native";
import { Search, Radar, TrendingUp, Zap } from "lucide-react-native";

interface OpportunityScannerProps {
  isScanning: boolean;
  opportunityCount: number;
  isLiveMode: boolean;
}

export function OpportunityScanner({ 
  isScanning, 
  opportunityCount, 
  isLiveMode 
}: OpportunityScannerProps) {
  const radarAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isScanning) {
      // Radar sweep animation
      Animated.loop(
        Animated.timing(radarAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        })
      ).start();

      // Pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Wave animation
      Animated.loop(
        Animated.timing(waveAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        })
      ).start();
    } else {
      radarAnim.setValue(0);
      pulseAnim.setValue(0);
      waveAnim.setValue(0);
    }
  }, [isScanning, radarAnim, pulseAnim, waveAnim]);

  const radarRotation = radarAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.2],
  });

  const waveScale = waveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.5],
  });

  const waveOpacity = waveAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.8, 0.3, 0],
  });

  return (
    <View style={styles.container}>
      <View style={styles.scannerContainer}>
        {/* Radar waves */}
        <Animated.View 
          style={[
            styles.radarWave,
            styles.wave1,
            {
              transform: [{ scale: waveScale }],
              opacity: waveOpacity,
            }
          ]} 
        />
        <Animated.View 
          style={[
            styles.radarWave,
            styles.wave2,
            {
              transform: [{ scale: pulseScale }],
              opacity: 0.4,
            }
          ]} 
        />
        
        {/* Main radar circle */}
        <View style={styles.radarCircle}>
          {/* Radar sweep */}
          {isScanning && (
            <Animated.View 
              style={[
                styles.radarSweep,
                { transform: [{ rotate: radarRotation }] }
              ]}
            />
          )}
          
          {/* Center icon */}
          <Animated.View 
            style={[
              styles.centerIcon,
              { transform: [{ scale: pulseScale }] }
            ]}
          >
            <Radar color="#10B981" size={28} />
          </Animated.View>
          
          {/* Opportunity dots */}
          <View style={styles.opportunityDots}>
            {Array.from({ length: Math.min(opportunityCount, 8) }).map((_, index) => (
              <Animated.View
                key={`opportunity-dot-${index}`}
                style={[
                  styles.opportunityDot,
                  {
                    top: 20 + (index % 4) * 20,
                    left: 20 + Math.floor(index / 4) * 40,
                    transform: [{ scale: pulseScale }],
                  }
                ]}
              />
            ))}
          </View>
        </View>
      </View>
      
      {/* Status display */}
      <View style={styles.statusContainer}>
        <View style={styles.statusHeader}>
          <Search color="#10B981" size={20} />
          <Text style={styles.statusTitle}>
            {isScanning ? 'Scanning Markets' : 'Market Scanner'}
          </Text>
          {isLiveMode && <Zap color="#F59E0B" size={16} />}
        </View>
        
        <View style={styles.metricsContainer}>
          <View style={styles.metric}>
            <TrendingUp color="#10B981" size={16} />
            <Text style={styles.metricValue}>{opportunityCount}</Text>
            <Text style={styles.metricLabel}>Opportunities</Text>
          </View>
          
          <View style={styles.metric}>
            <View style={[styles.statusDot, { backgroundColor: isScanning ? '#10B981' : '#6B7280' }]} />
            <Text style={styles.metricLabel}>
              {isScanning ? 'Live Scanning' : 'Standby'}
            </Text>
          </View>
          
          <View style={styles.metric}>
            <View style={[styles.statusDot, { backgroundColor: isLiveMode ? '#F59E0B' : '#6B7280' }]} />
            <Text style={styles.metricLabel}>
              {isLiveMode ? 'Live Mode' : 'Demo Mode'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1F2937",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: "center",
  },
  scannerContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  radarWave: {
    position: "absolute",
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#10B981",
  },
  wave1: {
    width: 100,
    height: 100,
  },
  wave2: {
    width: 80,
    height: 80,
  },
  radarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#111827",
    borderWidth: 2,
    borderColor: "#374151",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
  },
  radarSweep: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "transparent",
    borderTopWidth: 2,
    borderTopColor: "#10B981",
    borderRightWidth: 1,
    borderRightColor: "rgba(16, 185, 129, 0.3)",
  },
  centerIcon: {
    zIndex: 2,
  },
  opportunityDots: {
    position: "absolute",
    width: 80,
    height: 80,
  },
  opportunityDot: {
    position: "absolute",
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#F59E0B",
  },
  statusContainer: {
    alignItems: "center",
    width: "100%",
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  metricsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    gap: 16,
  },
  metric: {
    alignItems: "center",
    flex: 1,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#10B981",
    marginTop: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 2,
    textAlign: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
});