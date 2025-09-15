import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { TrendingUp, DollarSign } from "lucide-react-native";

interface ProfitSummaryProps {
  totalProfit: number;
}

export function ProfitSummary({ totalProfit }: ProfitSummaryProps) {
  return (
    <View style={styles.container}>
      <View style={styles.profitCard}>
        <View style={styles.iconContainer}>
          <DollarSign color="#00D4AA" size={24} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.label}>Total Profit (24h)</Text>
          <Text style={styles.value}>+${totalProfit.toLocaleString()}</Text>
        </View>
        <TrendingUp color="#00D4AA" size={20} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  profitCard: {
    backgroundColor: "#064E3B",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    color: "#6EE7B7",
    marginBottom: 4,
  },
  value: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
});