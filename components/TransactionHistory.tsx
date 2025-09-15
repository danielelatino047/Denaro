import React, { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { ArrowUpRight, ArrowDownLeft, Repeat, Info } from "lucide-react-native";
import { Transaction } from "@/stores/portfolio-store";
import { TradeDetailModal } from "./TradeDetailModal";

interface TransactionHistoryProps {
  transactions: Transaction[];
}

export function TransactionHistory({ transactions }: TransactionHistoryProps) {
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const getIcon = (type: Transaction["type"]) => {
    switch (type) {
      case "buy":
        return <ArrowDownLeft color="#EF4444" size={16} />;
      case "sell":
        return <ArrowUpRight color="#00D4AA" size={16} />;
      case "arbitrage":
        return <Repeat color="#00D4AA" size={16} />;
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const openDetailModal = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setModalVisible(true);
  };

  const closeDetailModal = () => {
    setModalVisible(false);
    setSelectedTransaction(null);
  };

  return (
    <View style={styles.container}>
      {transactions.map((transaction) => (
        <TouchableOpacity 
          key={transaction.id} 
          style={styles.transactionItem}
          onPress={() => openDetailModal(transaction)}
          activeOpacity={0.7}
        >
          <View style={styles.mainRow}>
            <View style={styles.iconContainer}>
              {getIcon(transaction.type)}
            </View>
            
            <View style={styles.details}>
              <Text style={styles.tokenPair}>{transaction.tokenPair}</Text>
              <Text style={styles.type}>{transaction.type.toUpperCase()}</Text>
              {transaction.type === 'arbitrage' && transaction.buyExchange && transaction.sellExchange && (
                <Text style={styles.exchangeInfo}>
                  {transaction.buyExchange}: ${transaction.buyPrice?.toFixed(8)} → {transaction.sellExchange}: ${transaction.sellPrice?.toFixed(8)}
                </Text>
              )}
            </View>
            
            <View style={styles.amounts}>
              <Text style={styles.amount}>
                {transaction.amount.toLocaleString(undefined, { maximumFractionDigits: 6 })} {transaction.tokenPair.split('/')[0]}
              </Text>
              <Text style={styles.usdtAmount}>
                ${(transaction.usdtAmount || 0).toFixed(2)} USDT
              </Text>
              {transaction.profit && (
                <Text style={styles.profit}>+${transaction.profit.toFixed(2)}</Text>
              )}
            </View>
            
            <View style={styles.timeContainer}>
              <Text style={styles.time}>{formatTime(transaction.timestamp)}</Text>
              <Text style={styles.date}>{formatDate(transaction.timestamp)}</Text>
              <Info color="#6B7280" size={16} />
            </View>
          </View>
        </TouchableOpacity>
      ))}
      
      <TradeDetailModal
        visible={modalVisible}
        transaction={selectedTransaction}
        onClose={closeDetailModal}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1F2937",
    borderRadius: 8,
    padding: 16,
  },
  transactionItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#374151",
  },
  mainRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    marginRight: 12,
  },
  details: {
    flex: 1,
  },
  tokenPair: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  type: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 2,
  },
  exchangeInfo: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 1,
  },
  amounts: {
    alignItems: "flex-end",
    marginRight: 12,
  },
  amount: {
    fontSize: 14,
    color: "#FFFFFF",
  },
  profit: {
    fontSize: 12,
    color: "#00D4AA",
    marginTop: 2,
  },
  usdtAmount: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 2,
  },
  timeContainer: {
    alignItems: "flex-end",
  },
  time: {
    fontSize: 12,
    color: "#6B7280",
  },
  date: {
    fontSize: 10,
    color: "#6B7280",
    marginTop: 1,
  },
});