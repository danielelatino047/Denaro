import React from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Switch,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useAITradingStore } from "@/stores/ai-trading-store";
import { TradingStats } from "@/components/TradingStats";
import { AISettings } from "@/components/AISettings";
import { AIScannerDisplay } from "@/components/AIScannerDisplay";

export default function AITradingScreen() {
  const {
    isEnabled,
    isScanning,
    scanningProgress,
    currentScanTarget,
    toggleAI,
    stats,
    settings,
    updateSettings,
  } = useAITradingStore();
  const insets = useSafeAreaInsets();

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
        <AIScannerDisplay 
          isScanning={isScanning}
          progress={scanningProgress}
          currentTarget={currentScanTarget}
          isEnabled={isEnabled}
        />

        <TradingStats stats={stats} />
        <AISettings settings={settings} onUpdateSettings={updateSettings} />

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
});