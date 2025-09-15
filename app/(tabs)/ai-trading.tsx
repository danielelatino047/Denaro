import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Switch,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";

export default function AITradingScreen() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isScanning] = useState(false);
  const [scanningProgress] = useState(0);
  const [currentScanTarget] = useState('');
  const insets = useSafeAreaInsets();
  
  const toggleAI = () => {
    setIsEnabled(!isEnabled);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>AI Trading Bot</Text>
        <View style={styles.toggleContainer}>
          <Text style={[styles.toggleLabel, { color: isEnabled ? "#00D4AA" : "#6B7280" }]}>
            {isEnabled ? "Active" : "Inactive"}
          </Text>
          <Switch
            value={isEnabled}
            onValueChange={toggleAI}
            trackColor={{ false: "#374151", true: "#00D4AA" }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.scannerCard}>
          <View style={styles.scannerHeader}>
            <MaterialIcons name="smart-toy" color="#00D4AA" size={24} />
            <Text style={styles.scannerTitle}>AI Scanner</Text>
          </View>
          <Text style={styles.scannerStatus}>
            {isScanning ? `Scanning... ${scanningProgress}%` : isEnabled ? 'Ready to scan' : 'Inactive'}
          </Text>
          {currentScanTarget && (
            <Text style={styles.scannerTarget}>Target: {currentScanTarget}</Text>
          )}
        </View>

        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Trading Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Total Trades</Text>
              <Text style={styles.statValue}>0</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Success Rate</Text>
              <Text style={styles.statValue}>0%</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Total Profit</Text>
              <Text style={styles.statValue}>$0.00</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Active Since</Text>
              <Text style={styles.statValue}>Never</Text>
            </View>
          </View>
        </View>

        <View style={styles.settingsCard}>
          <Text style={styles.settingsTitle}>AI Settings</Text>
          <Text style={styles.settingsDescription}>
            AI Trading Bot is ready to be configured. Enable to start automated trading.
          </Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <MaterialIcons name="smart-toy" color="#00D4AA" size={20} />
            <Text style={styles.infoTitle}>🤖 Autonomous AI Trading</Text>
          </View>
          <Text style={styles.infoText}>
            The AI automatically scans ALL profitable opportunities across Binance, Bybit, and KuCoin.
            No manual coin selection needed - it trades everything that meets your profit criteria.
          </Text>
          <Text style={styles.warningText}>
            ⚠️ Monitor your positions and ensure sufficient USDT balance for trading.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111827",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statusCard: {
    backgroundColor: "#1F2937",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  statusDescription: {
    fontSize: 14,
    color: "#9CA3AF",
    lineHeight: 20,
  },
  warningCard: {
    backgroundColor: "#FEF3C7",
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    marginBottom: 20,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#92400E",
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    color: "#92400E",
    lineHeight: 20,
    marginTop: 8,
  },
  infoCard: {
    backgroundColor: "#1F2937",
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    marginBottom: 20,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  infoText: {
    fontSize: 14,
    color: "#9CA3AF",
    lineHeight: 20,
    marginBottom: 8,
  },
  scannerCard: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  scannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  scannerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  scannerStatus: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  scannerTarget: {
    fontSize: 12,
    color: '#00D4AA',
  },
  statsCard: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  settingsCard: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  settingsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  settingsDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
  },
});