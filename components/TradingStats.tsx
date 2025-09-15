import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Activity, Target, Clock } from "lucide-react-native";
import { AITradingStats } from "@/stores/ai-trading-store";

interface TradingStatsProps {
  stats: AITradingStats;
}

export function TradingStats({ stats }: TradingStatsProps) {
  const successRate = (stats.successfulTrades / stats.totalTrades) * 100;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Trading Statistics</Text>
      
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Activity color="#00D4AA" size={20} />
          <Text style={styles.statValue}>{stats.totalTrades}</Text>
          <Text style={styles.statLabel}>Total Trades</Text>
        </View>

        <View style={styles.statCard}>
          <Target color="#00D4AA" size={20} />
          <Text style={styles.statValue}>{successRate.toFixed(1)}%</Text>
          <Text style={styles.statLabel}>Success Rate</Text>
        </View>

        <View style={styles.statCard}>
          <Clock color="#00D4AA" size={20} />
          <Text style={styles.statValue}>
            {stats.lastTradeTime ? 
              `${Math.floor((Date.now() - stats.lastTradeTime.getTime()) / (1000 * 60))}m` : 
              "N/A"
            }
          </Text>
          <Text style={styles.statLabel}>Last Trade</Text>
        </View>
      </View>

      <View style={styles.profitCard}>
        <Text style={styles.profitLabel}>Total AI Profit</Text>
        <Text style={styles.profitValue}>+${stats.totalProfit.toLocaleString()}</Text>
        <Text style={styles.averageProfit}>
          Avg: +${stats.averageProfit.toFixed(2)} per trade
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#1F2937",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
  },
  profitCard: {
    backgroundColor: "#064E3B",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  profitLabel: {
    fontSize: 14,
    color: "#6EE7B7",
    marginBottom: 4,
  },
  profitValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  averageProfit: {
    fontSize: 12,
    color: "#9CA3AF",
  },
});