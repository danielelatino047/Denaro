import React, { useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useArbitrageStore } from "@/stores/arbitrage-store";
import { OpportunityScanner } from "@/components/OpportunityScanner";
import { ArbitrageCard } from "@/components/ArbitrageCard";
import { ProfitSummary } from "@/components/ProfitSummary";

export default function ArbitrageScreen() {
  const {
    opportunities,
    isLoading,
    totalProfit,
    isLiveMode,
    fetchOpportunities,
    startLiveUpdates,
    stopLiveUpdates,
  } = useArbitrageStore();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    // Initial fetch
    fetchOpportunities();
    
    // Start live updates
    startLiveUpdates();
    
    // Cleanup on unmount
    return () => {
      stopLiveUpdates();
    };
  }, [fetchOpportunities, startLiveUpdates, stopLiveUpdates]);



  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Arbitrage Scanner</Text>
        <View style={styles.statusContainer}>
          <View style={[styles.statusDot, { backgroundColor: isLiveMode ? "#00D4AA" : "#F59E0B" }]} />
          <Text style={styles.statusText}>
            {isLiveMode ? "Live" : "Demo"}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView}>
        <OpportunityScanner 
          isScanning={isLoading}
          opportunityCount={opportunities.length}
          isLiveMode={isLiveMode}
        />

        <ProfitSummary totalProfit={totalProfit} />

        <View style={styles.opportunitiesSection}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="trending-up" color="#00D4AA" size={20} />
            <Text style={styles.sectionTitle}>Live Opportunities</Text>
            <Text style={styles.opportunityCount}>({opportunities.length})</Text>
          </View>

          {opportunities.length === 0 && !isLoading ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="search-off" color="#6B7280" size={48} />
              <Text style={styles.emptyTitle}>No Opportunities Found</Text>
              <Text style={styles.emptyDescription}>
                Pull to refresh or wait for new arbitrage opportunities to appear.
              </Text>
            </View>
          ) : (
            opportunities.map((opportunity, index) => (
              <ArbitrageCard
                key={`${opportunity.tokenPair}-${opportunity.buyExchange}-${opportunity.sellExchange}-${index}`}
                opportunity={opportunity}
              />
            ))
          )}
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <MaterialIcons name="info" color="#00D4AA" size={20} />
            <Text style={styles.infoTitle}>📊 Real-Time Arbitrage</Text>
          </View>
          <Text style={styles.infoText}>
            Scanning Binance, KuCoin, and Bybit for profitable price differences.
            All opportunities show net profit after trading fees.
          </Text>
          <Text style={styles.warningText}>
            ⚠️ Prices update every 30 seconds. Execute trades quickly as opportunities may disappear.
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
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#9CA3AF",
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  opportunitiesSection: {
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  opportunityCount: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 20,
    maxWidth: 250,
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
  warningText: {
    fontSize: 14,
    color: "#F59E0B",
    lineHeight: 20,
  },
});