import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ArbitrageScreen() {
  const [isLoading] = useState(false);
  const [opportunities] = useState<any[]>([]);
  const [totalProfit] = useState(0);
  const [isLiveMode] = useState(false);
  const insets = useSafeAreaInsets();



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
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00D4AA" />
            <Text style={styles.loadingText}>Scanning for arbitrage opportunities...</Text>
          </View>
        ) : (
          <>
            <View style={styles.scannerCard}>
              <View style={styles.scannerHeader}>
                <Text style={styles.scannerTitle}>📡 Opportunity Scanner</Text>
              </View>
              <Text style={styles.scannerStatus}>Scanner ready - {isLiveMode ? 'Live' : 'Demo'} mode</Text>
              <Text style={styles.scannerCount}>Found {opportunities.length} opportunities</Text>
            </View>

            <View style={styles.profitCard}>
              <Text style={styles.profitTitle}>Total Profit Potential</Text>
              <Text style={styles.profitAmount}>${totalProfit.toFixed(2)}</Text>
            </View>

            <View style={styles.opportunitiesSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>📈 Live Opportunities ({opportunities.length})</Text>
              </View>

              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>🔍</Text>
                <Text style={styles.emptyTitle}>No Opportunities Found</Text>
                <Text style={styles.emptyDescription}>
                  Scanner is ready. Opportunities will appear here when price differences are detected.
                </Text>
              </View>
            </View>
          </>
        )}

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>📊 Real-Time Arbitrage</Text>
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
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    color: '#9CA3AF',
    marginTop: 16,
    fontSize: 16,
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
  scannerCount: {
    fontSize: 14,
    color: '#00D4AA',
    fontWeight: '500',
  },
  profitCard: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  profitTitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  profitAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00D4AA',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
});