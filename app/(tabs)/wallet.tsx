import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function WalletScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<"deposit" | "withdraw" | "history">("deposit");
  const [usdtBalance] = useState(10000);
  const [totalDeposited] = useState(0);
  const [totalWithdrawn] = useState(0);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="wallet" size={28} color="#fff" />
          <Text style={styles.headerTitle}>Wallet</Text>
        </View>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Total Portfolio Value</Text>
          <Text style={styles.balanceAmount}>${usdtBalance.toFixed(2)}</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Total Deposited</Text>
              <Text style={styles.statValue}>${totalDeposited.toFixed(2)}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Total Withdrawn</Text>
              <Text style={styles.statValue}>${totalWithdrawn.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.depositButton]}
          >
            <Ionicons name="arrow-down-circle" size={24} color="#fff" />
            <Text style={styles.actionButtonText}>Deposit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.withdrawButton]}
          >
            <Ionicons name="arrow-up-circle" size={24} color="#fff" />
            <Text style={styles.actionButtonText}>Withdraw</Text>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "deposit" && styles.activeTab]}
            onPress={() => setActiveTab("deposit")}
          >
            <Text style={[styles.tabText, activeTab === "deposit" && styles.activeTabText]}>
              Deposit
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "history" && styles.activeTab]}
            onPress={() => setActiveTab("history")}
          >
            <Text style={[styles.tabText, activeTab === "history" && styles.activeTabText]}>
              Wallet History
            </Text>
          </TouchableOpacity>

        </View>

        {/* Tab Content */}
        {activeTab === "deposit" && (
          <View style={styles.tabContent}>
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Deposit USDT</Text>
              <Text style={styles.infoText}>
                Wallet functionality is ready. Deposit features will be available in the full version.
              </Text>
            </View>
          </View>
        )}

        {activeTab === "history" && (
          <View style={styles.tabContent}>
            <Text style={styles.emptyText}>No wallet transaction history</Text>
          </View>
        )}


      </ScrollView>


    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0E27",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold" as const,
    color: "#fff",
  },
  balanceCard: {
    backgroundColor: "#1C2541",
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  balanceLabel: {
    fontSize: 14,
    color: "#8892B0",
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: "bold" as const,
    color: "#fff",
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: "#8892B0",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#fff",
  },
  actionButtons: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  depositButton: {
    backgroundColor: "#4CAF50",
  },
  withdrawButton: {
    backgroundColor: "#FF9800",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600" as const,
  },
  tabs: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 8,
    backgroundColor: "#1C2541",
  },
  activeTab: {
    backgroundColor: "#007AFF",
  },
  tabText: {
    fontSize: 12,
    color: "#8892B0",
    fontWeight: "500" as const,
    textAlign: "center" as const,
  },
  activeTabText: {
    color: "#fff",
  },
  tabContent: {
    paddingHorizontal: 20,
  },
  selectorContainer: {
    marginBottom: 20,
  },
  selectorLabel: {
    fontSize: 14,
    color: "#8892B0",
    marginBottom: 12,
  },
  coinChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#1C2541",
    marginRight: 8,
  },
  selectedCoinChip: {
    backgroundColor: "#007AFF",
  },
  coinChipText: {
    fontSize: 14,
    color: "#8892B0",
    fontWeight: "500" as const,
  },
  selectedCoinChipText: {
    color: "#fff",
  },
  networkChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#1C2541",
    marginRight: 8,
  },
  selectedNetworkChip: {
    backgroundColor: "#4CAF50",
  },
  networkChipText: {
    fontSize: 14,
    color: "#8892B0",
    fontWeight: "500" as const,
  },
  selectedNetworkChipText: {
    color: "#fff",
  },
  addressContainer: {
    backgroundColor: "#1C2541",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  addressLabel: {
    fontSize: 14,
    color: "#8892B0",
    marginBottom: 12,
  },
  addressBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0A0E27",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: "#1C2541",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#fff",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#8892B0",
    lineHeight: 20,
  },
  copyButton: {
    padding: 8,
  },
  qrContainer: {
    alignItems: "center",
    marginTop: 16,
  },
  qrCode: {
    width: 200,
    height: 200,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 12,
  },
  qrLabel: {
    fontSize: 12,
    color: "#8892B0",
  },
  historyItem: {
    flexDirection: "row",
    backgroundColor: "#1C2541",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: "center",
  },
  historyIcon: {
    marginRight: 12,
  },
  historyDetails: {
    flex: 1,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#fff",
    marginBottom: 4,
  },
  historySubtitle: {
    fontSize: 14,
    color: "#8892B0",
    marginBottom: 2,
  },
  historyDate: {
    fontSize: 12,
    color: "#666",
  },
  historyRight: {
    alignItems: "flex-end",
  },
  historyAmount: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#fff",
    marginBottom: 4,
  },
  historyStatus: {
    fontSize: 12,
    fontWeight: "500" as const,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statuspending: {
    backgroundColor: "#FF9800",
    color: "#fff",
  },
  statusprocessing: {
    backgroundColor: "#2196F3",
    color: "#fff",
  },
  statusconfirmed: {
    backgroundColor: "#4CAF50",
    color: "#fff",
  },
  statuscompleted: {
    backgroundColor: "#4CAF50",
    color: "#fff",
  },
  statusfailed: {
    backgroundColor: "#F44336",
    color: "#fff",
  },
  emptyText: {
    textAlign: "center",
    color: "#8892B0",
    fontSize: 16,
    marginTop: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#1C2541",
    borderRadius: 16,
    padding: 20,
    width: "90%",
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold" as const,
    color: "#fff",
  },
  input: {
    backgroundColor: "#0A0E27",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#fff",
    marginBottom: 16,
  },
  modalButton: {
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600" as const,
  },
});