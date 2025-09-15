import React from "react";
import { StyleSheet, Text, View, TextInput } from "react-native";
import { Settings } from "lucide-react-native";
import { AITradingSettings } from "@/stores/ai-trading-store";

interface AISettingsProps {
  settings: AITradingSettings;
  onUpdateSettings: (settings: Partial<AITradingSettings>) => void;
}

export function AISettings({ settings, onUpdateSettings }: AISettingsProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Settings color="#00D4AA" size={20} />
        <Text style={styles.title}>AI Trading Configuration</Text>
      </View>

      <Text style={styles.description}>
        🤖 AI trades with 100% of your USDT balance for compound growth. Each successful trade reinvests the full new balance.
      </Text>

      <View style={styles.compoundInfo}>
        <Text style={styles.compoundTitle}>💰 Compound Trading Strategy</Text>
        <Text style={styles.compoundText}>
          • Trade 1: $100 → $110 (10% profit)
        </Text>
        <Text style={styles.compoundText}>
          • Trade 2: $110 → $121 (10% profit on full balance)
        </Text>
        <Text style={styles.compoundText}>
          • Trade 3: $121 → $133.10 (10% profit on full balance)
        </Text>
      </View>

      <View style={styles.settingItem}>
        <Text style={styles.settingLabel}>Min Profit (%)</Text>
        <TextInput
          style={styles.input}
          value={settings.minProfitPercentage.toString()}
          onChangeText={(text) =>
            onUpdateSettings({ minProfitPercentage: parseFloat(text) || 0 })
          }
          keyboardType="numeric"
          placeholder="0.1"
          placeholderTextColor="#6B7280"
        />
      </View>

      <View style={styles.settingItem}>
        <Text style={styles.settingLabel}>Max Slippage (%)</Text>
        <TextInput
          style={styles.input}
          value={settings.maxSlippage.toString()}
          onChangeText={(text) =>
            onUpdateSettings({ maxSlippage: parseFloat(text) || 0 })
          }
          keyboardType="numeric"
          placeholder="1.0"
          placeholderTextColor="#6B7280"
        />
      </View>

      <View style={styles.settingItem}>
        <Text style={styles.settingLabel}>Max Trades per Opportunity</Text>
        <TextInput
          style={styles.input}
          value={settings.maxTradesPerOpportunity.toString()}
          onChangeText={(text) =>
            onUpdateSettings({ maxTradesPerOpportunity: parseInt(text) || 0 })
          }
          keyboardType="numeric"
          placeholder="3"
          placeholderTextColor="#6B7280"
        />
      </View>

      <View style={styles.settingItem}>
        <Text style={styles.settingLabel}>Min Volume Threshold (USDT)</Text>
        <TextInput
          style={styles.input}
          value={settings.minVolumeThreshold.toString()}
          onChangeText={(text) =>
            onUpdateSettings({ minVolumeThreshold: parseFloat(text) || 0 })
          }
          keyboardType="numeric"
          placeholder="10000"
          placeholderTextColor="#6B7280"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1F2937",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#374151",
  },
  settingLabel: {
    fontSize: 16,
    color: "#FFFFFF",
    flex: 1,
  },
  input: {
    backgroundColor: "#374151",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: "#FFFFFF",
    fontSize: 16,
    minWidth: 80,
    textAlign: "right",
  },
  description: {
    fontSize: 14,
    color: "#9CA3AF",
    marginBottom: 16,
    lineHeight: 20,
  },
  compoundInfo: {
    backgroundColor: "#374151",
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    borderLeftWidth: 3,
    borderLeftColor: "#00D4AA",
  },
  compoundTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#00D4AA",
    marginBottom: 8,
  },
  compoundText: {
    fontSize: 14,
    color: "#D1D5DB",
    marginBottom: 4,
    fontFamily: "monospace",
  },
});