import React from "react";
import { StyleSheet, Text, View, Modal, TouchableOpacity, ScrollView } from "react-native";
import { X, ArrowRight, TrendingUp, DollarSign, Clock, Hash, Repeat2 } from "lucide-react-native";
import { Transaction } from "@/stores/portfolio-store";

interface TradeDetailModalProps {
  visible: boolean;
  transaction: Transaction | null;
  onClose: () => void;
}

export function TradeDetailModal({ visible, transaction, onClose }: TradeDetailModalProps) {
  if (!transaction) return null;

  const formatDateTime = (date: Date) => {
    return date.toLocaleString([], { 
      year: 'numeric',
      month: 'short', 
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getTypeColor = (type: Transaction["type"]) => {
    switch (type) {
      case "buy": return "#EF4444";
      case "sell": return "#00D4AA";
      case "arbitrage": return "#00D4AA";
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Trade Details</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X color="#9CA3AF" size={24} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Trade Summary Header */}
            <View style={styles.summaryHeader}>
              <View style={styles.summaryRow}>
                <Repeat2 color="#00D4AA" size={20} />
                <Text style={styles.summaryTitle}>{transaction.tokenPair}</Text>
              </View>
              
              {transaction.type === 'arbitrage' && transaction.buyExchange && transaction.sellExchange && (
                <View style={styles.tradePath}>
                  <Text style={styles.tradePathText}>
                    {transaction.buyExchange} {transaction.buyPrice?.toFixed(8)} → {transaction.sellExchange} → {transaction.sellPrice?.toFixed(8)}
                  </Text>
                </View>
              )}
              
              <View style={styles.volumeRow}>
                <DollarSign color="#9CA3AF" size={16} />
                <Text style={styles.volumeText}>Total Trade Volume: {transaction.usdtAmount.toFixed(2)} USDT</Text>
              </View>
            </View>

            {/* Trade Type Badge */}
            <View style={styles.typeBadgeContainer}>
              <View style={[styles.typeBadge, { backgroundColor: getTypeColor(transaction.type) + "20" }]}>
                <Text style={[styles.typeBadgeText, { color: getTypeColor(transaction.type) }]}>
                  {transaction.type.toUpperCase()} TRADE
                </Text>
              </View>
            </View>

            {/* Trade Details Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📊 Trade Information</Text>
              
              <View style={styles.detailCard}>
                <View style={styles.detailRow}>
                  <View style={styles.detailIcon}>
                    <Hash color="#6B7280" size={16} />
                  </View>
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Trade ID</Text>
                    <Text style={styles.detailValue}>{transaction.id}</Text>
                  </View>
                </View>
                
                <View style={styles.detailRow}>
                  <View style={styles.detailIcon}>
                    <Clock color="#6B7280" size={16} />
                  </View>
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Execution Time</Text>
                    <Text style={styles.detailValue}>{formatDateTime(transaction.timestamp)}</Text>
                  </View>
                </View>
                
                <View style={styles.detailRow}>
                  <View style={styles.detailIcon}>
                    <TrendingUp color="#6B7280" size={16} />
                  </View>
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Token Pair</Text>
                    <Text style={styles.detailValue}>{transaction.tokenPair}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Financial Details */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>💰 Financial Details</Text>
              
              <View style={styles.financialCard}>
                <View style={styles.financialRow}>
                  <Text style={styles.financialLabel}>Coin Quantity Traded</Text>
                  <Text style={styles.financialValue}>
                    {transaction.amount.toLocaleString(undefined, { maximumFractionDigits: 8 })} {transaction.tokenPair.split('/')[0]}
                  </Text>
                </View>
                
                <View style={styles.financialRow}>
                  <Text style={styles.financialLabel}>USDT Amount Invested</Text>
                  <Text style={styles.financialValueHighlight}>
                    ${transaction.usdtAmount.toFixed(2)} USDT
                  </Text>
                </View>

                {transaction.profit !== undefined && (
                  <View style={styles.financialRow}>
                    <Text style={styles.financialLabel}>Net Profit</Text>
                    <Text style={[styles.financialValue, styles.profitText]}>
                      +${transaction.profit.toFixed(2)} USDT
                    </Text>
                  </View>
                )}

                {transaction.profitPercentage !== undefined && (
                  <View style={styles.financialRow}>
                    <Text style={styles.financialLabel}>Profit Percentage</Text>
                    <Text style={[styles.financialValue, styles.profitText]}>
                      +{transaction.profitPercentage.toFixed(4)}%
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Arbitrage Execution Details */}
            {transaction.type === 'arbitrage' && transaction.buyExchange && transaction.sellExchange && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🔄 Arbitrage Execution</Text>
                
                <View style={styles.executionFlow}>
                  {/* Buy Transaction */}
                  <View style={styles.executionStep}>
                    <View style={styles.stepHeader}>
                      <View style={styles.stepNumber}>
                        <Text style={styles.stepNumberText}>1</Text>
                      </View>
                      <Text style={styles.stepTitle}>BUY ORDER</Text>
                    </View>
                    
                    <View style={styles.stepDetails}>
                      <View style={styles.stepDetailRow}>
                        <Text style={styles.stepDetailLabel}>Exchange:</Text>
                        <Text style={styles.stepDetailValue}>{transaction.buyExchange}</Text>
                      </View>
                      <View style={styles.stepDetailRow}>
                        <Text style={styles.stepDetailLabel}>Price per {transaction.tokenPair.split('/')[0]}:</Text>
                        <Text style={styles.stepDetailValue}>${transaction.buyPrice?.toFixed(8)}</Text>
                      </View>
                      <View style={styles.stepDetailRow}>
                        <Text style={styles.stepDetailLabel}>Quantity:</Text>
                        <Text style={styles.stepDetailValue}>
                          {transaction.amount.toLocaleString(undefined, { maximumFractionDigits: 8 })} {transaction.tokenPair.split('/')[0]}
                        </Text>
                      </View>
                      <View style={styles.stepDetailRow}>
                        <Text style={styles.stepDetailLabel}>Total Cost:</Text>
                        <Text style={styles.stepDetailValue}>${transaction.usdtAmount.toFixed(2)} USDT</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.arrowDown}>
                    <ArrowRight color="#00D4AA" size={24} style={styles.arrowRotated} />
                  </View>

                  {/* Sell Transaction */}
                  <View style={styles.executionStep}>
                    <View style={styles.stepHeader}>
                      <View style={styles.stepNumber}>
                        <Text style={styles.stepNumberText}>2</Text>
                      </View>
                      <Text style={styles.stepTitle}>SELL ORDER</Text>
                    </View>
                    
                    <View style={styles.stepDetails}>
                      <View style={styles.stepDetailRow}>
                        <Text style={styles.stepDetailLabel}>Exchange:</Text>
                        <Text style={styles.stepDetailValue}>{transaction.sellExchange}</Text>
                      </View>
                      <View style={styles.stepDetailRow}>
                        <Text style={styles.stepDetailLabel}>Price per {transaction.tokenPair.split('/')[0]}:</Text>
                        <Text style={styles.stepDetailValue}>${transaction.sellPrice?.toFixed(8)}</Text>
                      </View>
                      <View style={styles.stepDetailRow}>
                        <Text style={styles.stepDetailLabel}>Quantity:</Text>
                        <Text style={styles.stepDetailValue}>
                          {transaction.amount.toLocaleString(undefined, { maximumFractionDigits: 8 })} {transaction.tokenPair.split('/')[0]}
                        </Text>
                      </View>
                      <View style={styles.stepDetailRow}>
                        <Text style={styles.stepDetailLabel}>Total Received:</Text>
                        <Text style={styles.stepDetailValue}>
                          ${((transaction.sellPrice || 0) * transaction.amount).toFixed(2)} USDT
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Profit Summary */}
                <View style={styles.profitSummaryCard}>
                  <Text style={styles.profitSummaryTitle}>💎 Arbitrage Profit Summary</Text>
                  
                  <View style={styles.profitCalculation}>
                    <View style={styles.profitRow}>
                      <Text style={styles.profitLabel}>Price Difference:</Text>
                      <Text style={styles.profitValue}>
                        ${((transaction.sellPrice || 0) - (transaction.buyPrice || 0)).toFixed(8)} per {transaction.tokenPair.split('/')[0]}
                      </Text>
                    </View>
                    
                    <View style={styles.profitRow}>
                      <Text style={styles.profitLabel}>Percentage Gain:</Text>
                      <Text style={styles.profitValue}>
                        {(((transaction.sellPrice || 0) - (transaction.buyPrice || 0)) / (transaction.buyPrice || 1) * 100).toFixed(4)}%
                      </Text>
                    </View>
                    
                    <View style={styles.profitRowFinal}>
                      <Text style={styles.profitLabelFinal}>Net Profit (After Fees):</Text>
                      <Text style={styles.profitValueFinal}>
                        +${transaction.profit?.toFixed(2)} USDT
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            )}

          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalContent: {
    backgroundColor: "#1F2937",
    borderRadius: 20,
    width: "100%",
    maxWidth: 500,
    maxHeight: "95%",
    borderWidth: 1,
    borderColor: "#374151",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#374151",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  closeButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#374151",
  },
  scrollContent: {
    padding: 20,
  },
  summaryHeader: {
    backgroundColor: "#111827",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#00D4AA20",
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  summaryTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
    marginLeft: 12,
  },
  tradePath: {
    backgroundColor: "#00D4AA10",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  tradePathText: {
    fontSize: 16,
    color: "#00D4AA",
    fontWeight: "600",
    textAlign: "center",
  },
  volumeRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  volumeText: {
    fontSize: 16,
    color: "#9CA3AF",
    marginLeft: 8,
    fontWeight: "500",
  },
  typeBadgeContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  typeBadge: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#00D4AA40",
  },
  typeBadgeText: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 1,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 16,
  },
  detailCard: {
    backgroundColor: "#111827",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#374151",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#374151",
  },
  detailIcon: {
    width: 40,
    alignItems: "center",
  },
  detailContent: {
    flex: 1,
    marginLeft: 12,
  },
  detailLabel: {
    fontSize: 12,
    color: "#9CA3AF",
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 15,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  financialCard: {
    backgroundColor: "#111827",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#374151",
  },
  financialRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#374151",
  },
  financialLabel: {
    fontSize: 14,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  financialValue: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  financialValueHighlight: {
    fontSize: 18,
    color: "#00D4AA",
    fontWeight: "700",
  },
  profitText: {
    color: "#00D4AA",
  },
  executionFlow: {
    marginBottom: 20,
  },
  executionStep: {
    backgroundColor: "#111827",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#374151",
  },
  stepHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#00D4AA",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000000",
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  stepDetails: {
    paddingLeft: 44,
  },
  stepDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  stepDetailLabel: {
    fontSize: 13,
    color: "#9CA3AF",
    flex: 1,
  },
  stepDetailValue: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "600",
    textAlign: "right",
    flex: 1,
  },
  arrowDown: {
    alignItems: "center",
    marginVertical: 8,
  },
  profitSummaryCard: {
    backgroundColor: "#065F46",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#00D4AA40",
  },
  profitSummaryTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 16,
  },
  profitCalculation: {
    gap: 12,
  },
  profitRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  profitLabel: {
    fontSize: 14,
    color: "#6EE7B7",
    fontWeight: "500",
  },
  profitValue: {
    fontSize: 15,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  profitRowFinal: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#00D4AA40",
  },
  profitLabelFinal: {
    fontSize: 16,
    color: "#00D4AA",
    fontWeight: "700",
  },
  profitValueFinal: {
    fontSize: 18,
    color: "#00D4AA",
    fontWeight: "700",
  },
  arrowRotated: {
    transform: [{ rotate: '90deg' }],
  },
});