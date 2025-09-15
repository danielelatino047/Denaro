import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Modal,
} from "react-native";

import { TrendingUp, ArrowRight, Zap, X } from "lucide-react-native";
import { ArbitrageOpportunity, useArbitrageStore } from "@/stores/arbitrage-store";
import { useSettingsStore } from "@/stores/settings-store";
import { usePortfolioStore } from "@/stores/portfolio-store";

interface ArbitrageCardProps {
  opportunity: ArbitrageOpportunity;
}

export function ArbitrageCard({ opportunity }: ArbitrageCardProps) {
  const { executeArbitrage } = useArbitrageStore();
  const { settings } = useSettingsStore();
  const { balances } = usePortfolioStore();
  const [tradeAmount, setTradeAmount] = useState<string>('100');
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalConfig, setModalConfig] = useState<{
    title: string;
    message: string;
    buttons: { text: string; onPress?: () => void; style?: 'default' | 'destructive' }[];
  }>({ title: '', message: '', buttons: [] });

  const usdtBalance = balances.find(b => b.symbol === 'USDT')?.amount || 0;
  const maxTradeAmount = Math.min(usdtBalance, opportunity.maxTradeAmount, settings.maxTradeAmount);
  
  // Calculate fees based on exchanges
  const calculateTradingFees = (amount: number, buyExchange: string, sellExchange: string): number => {
    const exchangeFees: { [key: string]: number } = {
      'Binance': 0.001,     // 0.1%
      'KuCoin': 0.001,      // 0.1%
      'Bybit': 0.001,       // 0.1%
      'OKX': 0.0008,        // 0.08%
      'Gate.io': 0.002,     // 0.2%
      'Huobi': 0.002,       // 0.2%
      'CoinGecko': 0.0025,  // 0.25%
      'CoinCap': 0.0025,    // 0.25%
    };
    
    const buyFee = (exchangeFees[buyExchange] || 0.002) * amount;
    const sellFee = (exchangeFees[sellExchange] || 0.002) * amount;
    
    return buyFee + sellFee;
  };
  
  const tradeAmountNum = parseFloat(tradeAmount) || 0;
  const grossProfit = tradeAmountNum * (opportunity.profitPercentage / 100);
  const estimatedFees = calculateTradingFees(tradeAmountNum, opportunity.buyExchange, opportunity.sellExchange);
  const netProfit = grossProfit - estimatedFees;

  const showAlert = (title: string, message: string, buttons: { text: string; onPress?: () => void; style?: 'default' | 'destructive' }[]) => {
    setModalConfig({ title, message, buttons });
    setShowModal(true);
  };

  const handleExecute = async () => {
    const amount = parseFloat(tradeAmount);
    
    if (!amount || amount < opportunity.minTradeAmount) {
      showAlert('Invalid Amount', `Minimum trade amount is $${opportunity.minTradeAmount}`, [
        { text: 'OK', onPress: () => setShowModal(false) }
      ]);
      return;
    }
    
    if (amount > maxTradeAmount) {
      showAlert('Insufficient Balance', `Maximum trade amount is $${maxTradeAmount.toFixed(2)}`, [
        { text: 'OK', onPress: () => setShowModal(false) }
      ]);
      return;
    }
    
    if (settings.isLiveMode) {
      showAlert(
        'Live Trading',
        'This will execute a real trade with real money. Are you sure?',
        [
          { text: 'Cancel', onPress: () => setShowModal(false) },
          { 
            text: 'Execute', 
            style: 'destructive',
            onPress: () => {
              setShowModal(false);
              executeTradeConfirmed(amount);
            }
          }
        ]
      );
    } else {
      executeTradeConfirmed(amount);
    }
  };
  
  const executeTradeConfirmed = async (amount: number) => {
    setIsExecuting(true);
    try {
      await executeArbitrage(opportunity, amount);
      showAlert(
        'Trade Executed',
        `${settings.isLiveMode ? 'Live' : 'Demo'} arbitrage trade completed!\nProfit: $${netProfit.toFixed(2)}`,
        [{ text: 'OK', onPress: () => setShowModal(false) }]
      );
    } catch {
      showAlert('Trade Failed', 'Failed to execute arbitrage trade', [
        { text: 'OK', onPress: () => setShowModal(false) }
      ]);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.tokenPair}>{opportunity.tokenPair}</Text>
        <View style={styles.profitBadge}>
          <TrendingUp color="#00D4AA" size={16} />
          <Text style={styles.profitPercentage}>
            +{opportunity.profitPercentage.toFixed(2)}%
          </Text>
        </View>
      </View>

      <View style={styles.exchangeRow}>
        <View style={styles.exchangeInfo}>
          <Text style={styles.exchangeLabel}>Buy</Text>
          <Text style={styles.exchangeName}>{opportunity.buyExchange}</Text>
          <Text style={styles.price}>${opportunity.buyPrice.toLocaleString()}</Text>
        </View>

        <ArrowRight color="#6B7280" size={20} />

        <View style={styles.exchangeInfo}>
          <Text style={styles.exchangeLabel}>Sell</Text>
          <Text style={styles.exchangeName}>{opportunity.sellExchange}</Text>
          <Text style={styles.price}>${opportunity.sellPrice.toLocaleString()}</Text>
        </View>
      </View>

      <View style={styles.details}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Profit</Text>
          <Text style={styles.profitAmount}>
            +${opportunity.profitAmount.toFixed(2)}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Volume</Text>
          <Text style={styles.detailValue}>
            ${(opportunity.volume / 1000).toFixed(0)}K
          </Text>
        </View>
      </View>

      <View style={styles.tradeSection}>
        <View style={styles.tradeInputRow}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Trade Amount (USDT)</Text>
            <TextInput
              style={styles.tradeInput}
              value={tradeAmount}
              onChangeText={setTradeAmount}
              placeholder="100"
              placeholderTextColor="#6B7280"
              keyboardType="numeric"
            />
          </View>
          <View style={styles.profitContainer}>
            <Text style={styles.inputLabel}>Est. Profit</Text>
            <Text style={[styles.profitText, netProfit > 0 ? styles.positiveProfit : styles.negativeProfit]}>
              ${netProfit.toFixed(2)}
            </Text>
          </View>
        </View>
        
        <View style={styles.tradeInfo}>
          <Text style={styles.tradeInfoText}>
            Max: ${maxTradeAmount.toFixed(2)} • Fees: ${estimatedFees.toFixed(2)} ({opportunity.buyExchange}: {((calculateTradingFees(tradeAmountNum, opportunity.buyExchange, opportunity.sellExchange) / 2 / tradeAmountNum) * 100).toFixed(2)}%, {opportunity.sellExchange}: {((calculateTradingFees(tradeAmountNum, opportunity.buyExchange, opportunity.sellExchange) / 2 / tradeAmountNum) * 100).toFixed(2)}%)
          </Text>
        </View>
        
        <TouchableOpacity 
          style={[
            styles.executeButton, 
            settings.isLiveMode ? styles.liveButton : styles.demoButton,
            isExecuting && styles.executingButton
          ]} 
          onPress={handleExecute}
          disabled={isExecuting}
        >
          <Zap color="#FFFFFF" size={16} />
          <Text style={styles.executeButtonText}>
            {isExecuting ? 'Executing...' : `${settings.isLiveMode ? 'LIVE' : 'DEMO'} Swap`}
          </Text>
        </TouchableOpacity>
      </View>
      
      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{modalConfig.title}</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <X color="#6B7280" size={20} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalMessage}>{modalConfig.message}</Text>
            <View style={styles.modalButtons}>
              {modalConfig.buttons.map((button) => (
                <TouchableOpacity
                  key={button.text}
                  style={[
                    styles.modalButton,
                    button.style === 'destructive' ? styles.destructiveButton : styles.defaultButton
                  ]}
                  onPress={button.onPress}
                >
                  <Text style={[
                    styles.modalButtonText,
                    button.style === 'destructive' ? styles.destructiveButtonText : styles.defaultButtonText
                  ]}>
                    {button.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1F2937",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  tokenPair: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  profitBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#064E3B",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  profitPercentage: {
    fontSize: 14,
    fontWeight: "600",
    color: "#00D4AA",
  },
  exchangeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  exchangeInfo: {
    alignItems: "center",
    flex: 1,
  },
  exchangeLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
  },
  exchangeName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#00D4AA",
  },
  details: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#374151",
  },
  detailItem: {
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
  },
  profitAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#00D4AA",
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  tradeSection: {
    marginTop: 8,
  },
  tradeInputRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 8,
  },
  inputContainer: {
    flex: 2,
  },
  profitContainer: {
    flex: 1,
    alignItems: "flex-end",
  },
  inputLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
  },
  tradeInput: {
    backgroundColor: "#374151",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  profitText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  positiveProfit: {
    color: "#00D4AA",
  },
  negativeProfit: {
    color: "#EF4444",
  },
  tradeInfo: {
    marginBottom: 12,
  },
  tradeInfoText: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
  },
  executeButton: {
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  demoButton: {
    backgroundColor: "#00D4AA",
  },
  liveButton: {
    backgroundColor: "#EF4444",
  },
  executingButton: {
    opacity: 0.6,
  },
  executeButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#1F2937",
    borderRadius: 12,
    padding: 20,
    width: "100%",
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  modalMessage: {
    fontSize: 16,
    color: "#D1D5DB",
    marginBottom: 20,
    lineHeight: 24,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  defaultButton: {
    backgroundColor: "#374151",
  },
  destructiveButton: {
    backgroundColor: "#EF4444",
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  defaultButtonText: {
    color: "#FFFFFF",
  },
  destructiveButtonText: {
    color: "#FFFFFF",
  },
});