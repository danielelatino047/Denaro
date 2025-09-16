import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

export default function ArbitrageScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Arbitrage Scanner</Text>
        <View style={styles.statusContainer}>
          <View style={[styles.statusDot, { backgroundColor: '#00D4AA' }]} />
          <Text style={styles.statusText}>Active</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.scannerCard}>
          <View style={styles.scannerHeader}>
            <MaterialIcons name="search" color="#00D4AA" size={24} />
            <Text style={styles.scannerTitle}>Market Scanner</Text>
          </View>
          <Text style={styles.scannerStatus}>Scanning 3 exchanges for opportunities...</Text>
          <Text style={styles.scannerCount}>Found 0 opportunities</Text>
        </View>

        <View style={styles.profitCard}>
          <Text style={styles.profitTitle}>Total Profit (24h)</Text>
          <Text style={styles.profitAmount}>$0.00</Text>
        </View>

        <View style={styles.controlsCard}>
          <TouchableOpacity style={[styles.scanButton, styles.startButton]}>
            <Text style={styles.scanButtonText}>Start Scanning</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <MaterialIcons name="info" color="#00D4AA" size={20} />
            <Text style={styles.infoTitle}>🔍 Arbitrage Trading</Text>
          </View>
          <Text style={styles.infoText}>
            Automatically finds price differences across Binance, Bybit, and KuCoin.
            Execute profitable trades with minimal risk.
          </Text>
          <Text style={styles.warningText}>
            ⚠️ Ensure you have accounts and API keys configured for all exchanges.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
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
  scanButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  infoCard: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  infoText: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    color: '#F59E0B',
    lineHeight: 20,
  },
});