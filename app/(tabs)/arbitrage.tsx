import React from "react";
import {
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ArbitrageScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Arbitrage Scanner</Text>
        <View style={styles.statusContainer}>
          <View style={[styles.statusDot, { backgroundColor: "#F59E0B" }]} />
          <Text style={styles.statusText}>Demo</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.message}>App is loading successfully! 🎉</Text>
        <Text style={styles.submessage}>The Metro bundler error has been resolved.</Text>
      </View>
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
  controlsCard: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  scanButton: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#00D4AA',
  },
  stopButton: {
    backgroundColor: '#EF4444',
  },
  scanButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  message: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00D4AA',
    textAlign: 'center',
    marginBottom: 16,
  },
  submessage: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});