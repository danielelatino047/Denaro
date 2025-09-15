import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { TrendingUp, TrendingDown } from "lucide-react-native";
import { Balance } from "@/stores/portfolio-store";

interface BalanceCardProps {
  balance: Balance;
}

export function BalanceCard({ balance }: BalanceCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.symbol}>{balance.symbol}</Text>
        <View style={styles.changeContainer}>
          {balance.change24h >= 0 ? (
            <TrendingUp color="#00D4AA" size={16} />
          ) : (
            <TrendingDown color="#EF4444" size={16} />
          )}
          <Text style={[styles.change, { color: balance.change24h >= 0 ? "#00D4AA" : "#EF4444" }]}>
            {balance.change24h >= 0 ? "+" : ""}{balance.change24h.toFixed(2)}%
          </Text>
        </View>
      </View>
      
      <View style={styles.amounts}>
        <Text style={styles.amount}>{balance.amount.toLocaleString()}</Text>
        <Text style={styles.usdValue}>${balance.usdValue.toLocaleString()}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1F2937",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  symbol: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  changeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  change: {
    fontSize: 14,
    fontWeight: "600",
  },
  amounts: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  amount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  usdValue: {
    fontSize: 16,
    color: "#9CA3AF",
  },
});