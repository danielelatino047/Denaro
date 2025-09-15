import React from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TrendingUp, TrendingDown, History } from "lucide-react-native";
import { usePortfolioStore } from "../../stores/portfolio-store";
import { BalanceCard } from "../../components/BalanceCard";
import { TransactionHistory } from "../../components/TransactionHistory";

export default function PortfolioScreen() {
  const { balances, totalValue, dailyPnL, transactions } = usePortfolioStore();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Portfolio</Text>
        <TouchableOpacity style={styles.historyButton}>
          <History color="#00D4AA" size={20} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Portfolio Value</Text>
          <Text style={styles.summaryValue}>${totalValue.toLocaleString()}</Text>
          <View style={styles.pnlContainer}>
            {dailyPnL >= 0 ? (
              <TrendingUp color="#00D4AA" size={16} />
            ) : (
              <TrendingDown color="#EF4444" size={16} />
            )}
            <Text style={[styles.pnlText, { color: dailyPnL >= 0 ? "#00D4AA" : "#EF4444" }]}>
              {dailyPnL >= 0 ? "+" : ""}${Math.abs(dailyPnL).toFixed(2)} (24h)
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Balances</Text>
          {balances.map((balance) => (
            <BalanceCard key={balance.symbol} balance={balance} />
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <TransactionHistory transactions={transactions.slice(0, 10)} />
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
  historyButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  summaryCard: {
    backgroundColor: "#1F2937",
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 14,
    color: "#9CA3AF",
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 12,
  },
  pnlContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  pnlText: {
    fontSize: 16,
    fontWeight: "600",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 16,
  },
});