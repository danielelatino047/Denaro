import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Image,
  Platform,
} from "react-native";
import { useWalletStore } from "@/stores/wallet-store";
import { usePortfolioStore } from "@/stores/portfolio-store";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function WalletScreen() {
  const {
    walletAddresses,
    depositHistory,
    withdrawalHistory,
    totalDeposited,
    totalWithdrawn,
    initializeWallet,
    depositUSDT,
    withdrawUSDT,
    getUSDTAddress,
    isInitialized,
    usdtBalance,
  } = useWalletStore();

  const { balances, totalValue, transactions } = usePortfolioStore();
  const insets = useSafeAreaInsets();

  const [selectedCoin, setSelectedCoin] = useState("USDT");
  const [selectedNetwork, setSelectedNetwork] = useState("ERC-20 (Ethereum)");
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawAddress, setWithdrawAddress] = useState("");
  const [activeTab, setActiveTab] = useState<"deposit" | "withdraw" | "history" | "trading">("deposit");

  useEffect(() => {
    if (!isInitialized) {
      initializeWallet();
    }
  }, [isInitialized, initializeWallet]);

  const handleDeposit = () => {
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid amount");
      return;
    }

    depositUSDT(amount, selectedNetwork);
    setDepositAmount("");
    setShowDepositModal(false);
    Alert.alert("Deposit Initiated", `Your ${amount} ${selectedCoin} deposit is being processed`);
  };

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid amount");
      return;
    }

    if (!withdrawAddress) {
      Alert.alert("Invalid Address", "Please enter a withdrawal address");
      return;
    }

    const balance = usdtBalance;
    if (amount > balance) {
      Alert.alert("Insufficient Balance", `You only have ${balance.toFixed(4)} ${selectedCoin}`);
      return;
    }

    withdrawUSDT(amount, withdrawAddress, selectedNetwork);
    setWithdrawAmount("");
    setWithdrawAddress("");
    setShowWithdrawModal(false);
    Alert.alert("Withdrawal Initiated", `Your ${amount} ${selectedCoin} withdrawal is being processed`);
  };

  const copyToClipboard = (text: string) => {
    Alert.alert("Copied", "Address copied to clipboard");
  };

  const getNetworksForCoin = (coin: string) => {
    const networks = walletAddresses
      .filter(w => w.coin === coin)
      .map(w => w.network);
    return [...new Set(networks)];
  };

  const availableCoins = ["USDT"]; // Only USDT is supported

  const currentAddress = getUSDTAddress(selectedNetwork);

  const allHistory = [
    ...depositHistory.map(d => ({ ...d, type: "deposit" as const, coin: "USDT", usdValue: d.amount })),
    ...withdrawalHistory.map(w => ({ ...w, type: "withdraw" as const, coin: "USDT", usdValue: w.amount })),
  ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

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
            onPress={() => setShowDepositModal(true)}
          >
            <Ionicons name="arrow-down-circle" size={24} color="#fff" />
            <Text style={styles.actionButtonText}>Deposit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.withdrawButton]}
            onPress={() => setShowWithdrawModal(true)}
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
          <TouchableOpacity
            style={[styles.tab, activeTab === "trading" && styles.activeTab]}
            onPress={() => setActiveTab("trading")}
          >
            <Text style={[styles.tabText, activeTab === "trading" && styles.activeTabText]}>
              Trading History
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {activeTab === "deposit" && (
          <View style={styles.tabContent}>
            {/* Coin Selector */}
            <View style={styles.selectorContainer}>
              <Text style={styles.selectorLabel}>Select Coin</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {availableCoins.map(coin => (
                  <TouchableOpacity
                    key={coin}
                    style={[styles.coinChip, selectedCoin === coin && styles.selectedCoinChip]}
                    onPress={() => {
                      setSelectedCoin(coin);
                      const networks = getNetworksForCoin(coin);
                      if (networks.length > 0 && !networks.includes(selectedNetwork)) {
                        setSelectedNetwork(networks[0]);
                      }
                    }}
                  >
                    <Text style={[styles.coinChipText, selectedCoin === coin && styles.selectedCoinChipText]}>
                      {coin}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Network Selector */}
            <View style={styles.selectorContainer}>
              <Text style={styles.selectorLabel}>Select Network</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {getNetworksForCoin(selectedCoin).map(network => (
                  <TouchableOpacity
                    key={network}
                    style={[styles.networkChip, selectedNetwork === network && styles.selectedNetworkChip]}
                    onPress={() => setSelectedNetwork(network)}
                  >
                    <Text style={[styles.networkChipText, selectedNetwork === network && styles.selectedNetworkChipText]}>
                      {network}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Deposit Address */}
            {currentAddress && (
              <View style={styles.addressContainer}>
                <Text style={styles.addressLabel}>Your {selectedCoin} Address ({selectedNetwork})</Text>
                <View style={styles.addressBox}>
                  <Text style={styles.addressText} numberOfLines={2}>
                    {currentAddress.address}
                  </Text>
                  <TouchableOpacity
                    style={styles.copyButton}
                    onPress={() => copyToClipboard(currentAddress.address)}
                  >
                    <Ionicons name="copy" size={20} color="#007AFF" />
                  </TouchableOpacity>
                </View>
                {currentAddress.qrCode && Platform.OS !== "web" && (
                  <View style={styles.qrContainer}>
                    <Image source={{ uri: currentAddress.qrCode }} style={styles.qrCode} />
                    <Text style={styles.qrLabel}>Scan to deposit {selectedCoin}</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        )}

        {activeTab === "history" && (
          <View style={styles.tabContent}>
            {allHistory.length === 0 ? (
              <Text style={styles.emptyText}>No wallet transaction history</Text>
            ) : (
              allHistory.slice(0, 20).map((item, index) => (
                <View key={item.id} style={styles.historyItem}>
                  <View style={styles.historyIcon}>
                    {item.type === "deposit" ? (
                      <Ionicons name="arrow-down-circle" size={24} color="#4CAF50" />
                    ) : (
                      <Ionicons name="arrow-up-circle" size={24} color="#FF9800" />
                    )}
                  </View>
                  <View style={styles.historyDetails}>
                    <Text style={styles.historyTitle}>
                      {item.type === "deposit" ? "Deposit" : "Withdrawal"} {item.coin}
                    </Text>
                    <Text style={styles.historySubtitle}>
                      {item.amount.toFixed(4)} {item.coin} • {item.network}
                    </Text>
                    <Text style={styles.historyDate}>
                      {item.timestamp.toLocaleDateString()} {item.timestamp.toLocaleTimeString()}
                    </Text>
                  </View>
                  <View style={styles.historyRight}>
                    <Text style={styles.historyAmount}>${item.usdValue.toFixed(2)}</Text>
                    <Text style={[styles.historyStatus, styles[`status${item.status}`]]}>
                      {item.status}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {activeTab === "trading" && (
          <View style={styles.tabContent}>
            {transactions.length === 0 ? (
              <Text style={styles.emptyText}>No trading history</Text>
            ) : (
              transactions.slice(0, 50).map((transaction) => (
                <View key={transaction.id} style={styles.historyItem}>
                  <View style={styles.historyIcon}>
                    {transaction.type === "buy" && <Ionicons name="arrow-down-circle" size={24} color="#EF4444" />}
                    {transaction.type === "sell" && <Ionicons name="arrow-up-circle" size={24} color="#00D4AA" />}
                    {transaction.type === "arbitrage" && <Ionicons name="arrow-up-circle" size={24} color="#007AFF" />}
                  </View>
                  <View style={styles.historyDetails}>
                    <Text style={styles.historyTitle}>
                      {transaction.type.toUpperCase()} {transaction.tokenPair}
                    </Text>
                    <Text style={styles.historySubtitle}>
                      {transaction.amount.toFixed(6)} • ${transaction.price.toFixed(2)}
                    </Text>
                    <Text style={styles.historyDate}>
                      {transaction.timestamp.toLocaleDateString()} {transaction.timestamp.toLocaleTimeString()}
                    </Text>
                  </View>
                  <View style={styles.historyRight}>
                    {transaction.profit && (
                      <Text style={[styles.historyAmount, { color: transaction.profit > 0 ? "#4CAF50" : "#EF4444" }]}>
                        {transaction.profit > 0 ? "+" : ""}${transaction.profit.toFixed(2)}
                      </Text>
                    )}
                    <Text style={[styles.historyStatus, styles[`status${transaction.status}`]]}>
                      {transaction.status}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* Deposit Modal */}
      <Modal visible={showDepositModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Deposit {selectedCoin}</Text>
              <TouchableOpacity onPress={() => setShowDepositModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Enter amount"
              placeholderTextColor="#999"
              value={depositAmount}
              onChangeText={setDepositAmount}
              keyboardType="numeric"
            />
            <TouchableOpacity style={styles.modalButton} onPress={handleDeposit}>
              <Text style={styles.modalButtonText}>Simulate Deposit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Withdraw Modal */}
      <Modal visible={showWithdrawModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Withdraw {selectedCoin}</Text>
              <TouchableOpacity onPress={() => setShowWithdrawModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Enter amount"
              placeholderTextColor="#999"
              value={withdrawAmount}
              onChangeText={setWithdrawAmount}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Enter withdrawal address"
              placeholderTextColor="#999"
              value={withdrawAddress}
              onChangeText={setWithdrawAddress}
            />
            <TouchableOpacity style={styles.modalButton} onPress={handleWithdraw}>
              <Text style={styles.modalButtonText}>Process Withdrawal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  addressText: {
    flex: 1,
    fontSize: 12,
    color: "#fff",
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
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