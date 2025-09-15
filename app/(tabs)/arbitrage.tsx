import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import ComponentErrorBoundary from "@/components/ComponentErrorBoundary";

export default function ArbitrageScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);
  const [wsConnected] = useState(false);
  const [totalProfit] = useState(0);
  const [isLiveModeFromSettings, setIsLiveModeFromSettings] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    // Load stores and initialize
    const initializeStores = async () => {
      try {
        const { useSettingsStore } = await import('@/stores/settings-store');
        const { settings } = useSettingsStore.getState();
        setIsLiveModeFromSettings(settings.isLiveMode);
        
        const { useArbitrageStore } = await import('@/stores/arbitrage-store');
        const arbitrageStore = useArbitrageStore.getState();
        
        // Load initial data
        await arbitrageStore.refreshOpportunities();
        setOpportunities(arbitrageStore.opportunities);
        setLastUpdateTime(arbitrageStore.lastUpdateTime);
        
      } catch (error) {
        console.error('Error initializing arbitrage screen:', error);
        // Set some demo data as fallback
        setOpportunities([
          {
            tokenPair: 'BTC/USDT',
            buyExchange: 'Binance',
            sellExchange: 'Bybit',
            buyPrice: 45000,
            sellPrice: 45100,
            profitPercentage: 0.22,
            profitAmount: 100,
            volume: 150000,
            minTradeAmount: 10,
            maxTradeAmount: 5000,
            lastUpdated: new Date()
          }
        ]);
        setLastUpdateTime(new Date());
      }
    };
    
    initializeStores();
  }, []);
  
  const handleManualRefresh = async () => {
    setIsLoading(true);
    try {
      const { useArbitrageStore } = await import('@/stores/arbitrage-store');
      const arbitrageStore = useArbitrageStore.getState();
      await arbitrageStore.refreshOpportunities();
      setOpportunities(arbitrageStore.opportunities);
      setLastUpdateTime(arbitrageStore.lastUpdateTime);
    } catch (error) {
      console.error('Error refreshing opportunities:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const toggleLiveMode = async () => {
    try {
      const { useArbitrageStore } = await import('@/stores/arbitrage-store');
      const arbitrageStore = useArbitrageStore.getState();
      
      if (isLiveMode) {
        arbitrageStore.stopLiveUpdates();
        setIsLiveMode(false);
      } else {
        arbitrageStore.startLiveUpdates();
        setIsLiveMode(true);
      }
    } catch (error) {
      console.error('Error toggling live mode:', error);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Arbitrage Scanner</Text>
          <View style={styles.statusRow}>
            {wsConnected ? (
              <Ionicons name="wifi" color="#00D4AA" size={14} />
            ) : (
              <MaterialIcons name="show-chart" color={isLiveMode ? "#00D4AA" : "#6B7280"} size={14} />
            )}
            <Text style={styles.statusText}>
              {wsConnected ? 'WebSocket Live' : isLiveMode ? 'REST API (30s)' : 'Paused'}
            </Text>
            {lastUpdateTime && (
              <>
                <MaterialIcons name="access-time" color="#6B7280" size={14} />
                <Text style={styles.statusText}>
                  {lastUpdateTime.toLocaleTimeString()}
                </Text>
              </>
            )}
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={[styles.liveButton, isLiveMode && styles.liveButtonActive]}
            onPress={toggleLiveMode}
          >
            {isLiveMode ? (
              <Ionicons name="pause" color={"#FFFFFF"} size={16} />
            ) : (
              <Ionicons name="play" color={"#00D4AA"} size={16} />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={handleManualRefresh}
            disabled={isLoading}
          >
            <MaterialIcons 
              name="refresh" 
              color="#00D4AA" 
              size={20} 
            />
          </TouchableOpacity>
        </View>
      </View>

      <ComponentErrorBoundary componentName="OpportunityScanner">
        <View style={styles.scannerContainer}>
          <View style={styles.scannerHeader}>
            <MaterialIcons name="radar" color="#00D4AA" size={24} />
            <Text style={styles.scannerTitle}>Market Scanner</Text>
          </View>
          <Text style={styles.scannerStatus}>
            {isLoading || isLiveMode ? 'Scanning...' : 'Ready'} • {opportunities.length} opportunities
          </Text>
        </View>
      </ComponentErrorBoundary>
      
      <ComponentErrorBoundary componentName="ProfitSummary">
        <View style={styles.profitContainer}>
          <Text style={styles.profitTitle}>Total Profit Potential</Text>
          <Text style={styles.profitAmount}>${totalProfit.toFixed(2)}</Text>
        </View>
      </ComponentErrorBoundary>

      <ScrollView style={styles.scrollView}>
        {opportunities.length === 0 && !isLoading ? (
          <View style={styles.emptyState}>
            <Ionicons name="flash" color="#6B7280" size={48} />
            <Text style={styles.emptyTitle}>No Opportunities Found</Text>
            <Text style={styles.emptyDescription}>
              {isLiveMode 
                ? 'Monitoring live prices for profitable arbitrage opportunities...' 
                : 'Tap play button to start live monitoring or refresh manually'
              }
            </Text>
          </View>
        ) : isLoading && opportunities.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="show-chart" color="#00D4AA" size={48} />
            <Text style={styles.emptyTitle}>Scanning Markets...</Text>
            <Text style={styles.emptyDescription}>
              Fetching live prices from Binance, Bybit & KuCoin across 30+ coins
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.opportunityHeader}>
              <Text style={styles.opportunityCount}>
                {opportunities.length} {isLiveModeFromSettings ? 'Live' : 'Demo'} Opportunities
              </Text>
              <Text style={styles.opportunitySubtext}>
                Sorted by net profit (after fees) • {wsConnected ? 'WebSocket' : isLiveMode ? 'REST API' : 'Manual'} • {isLiveModeFromSettings ? 'Real Trading' : 'Simulation'}
              </Text>
            </View>
            {opportunities.map((opportunity, index) => (
              <ComponentErrorBoundary 
                key={`${opportunity.tokenPair}-${opportunity.buyExchange}-${opportunity.sellExchange}-${index}`}
                componentName="ArbitrageCard"
              >
                <View style={styles.opportunityCard}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.tokenPair}>{opportunity.tokenPair}</Text>
                    <Text style={styles.profitBadge}>+{opportunity.profitPercentage.toFixed(2)}%</Text>
                  </View>
                  <View style={styles.cardBody}>
                    <View style={styles.exchangeInfo}>
                      <Text style={styles.exchangeLabel}>Buy: {opportunity.buyExchange}</Text>
                      <Text style={styles.price}>${opportunity.buyPrice.toLocaleString()}</Text>
                    </View>
                    <MaterialIcons name="arrow-forward" color="#00D4AA" size={20} />
                    <View style={styles.exchangeInfo}>
                      <Text style={styles.exchangeLabel}>Sell: {opportunity.sellExchange}</Text>
                      <Text style={styles.price}>${opportunity.sellPrice.toLocaleString()}</Text>
                    </View>
                  </View>
                  <View style={styles.cardFooter}>
                    <Text style={styles.volume}>Volume: ${opportunity.volume.toLocaleString()}</Text>
                    <TouchableOpacity style={styles.tradeButton}>
                      <Text style={styles.tradeButtonText}>Execute Trade</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ComponentErrorBoundary>
            ))}
          </>
        )}
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
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  refreshButton: {
    padding: 8,
  },
  liveButton: {
    backgroundColor: "#1F2937",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#374151",
  },
  liveButtonActive: {
    backgroundColor: "#00D4AA",
    borderColor: "#00D4AA",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  statusText: {
    fontSize: 12,
    color: "#6B7280",
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
    marginTop: 16,
  },
  emptyDescription: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 8,
    textAlign: "center",
  },
  opportunityHeader: {
    paddingVertical: 16,
    alignItems: "center",
  },
  opportunityCount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#00D4AA",
  },
  opportunitySubtext: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  scannerContainer: {
    backgroundColor: "#1F2937",
    margin: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#374151",
  },
  scannerHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  scannerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginLeft: 8,
  },
  scannerStatus: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  profitContainer: {
    backgroundColor: "#1F2937",
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#374151",
    alignItems: "center",
  },
  profitTitle: {
    fontSize: 14,
    color: "#9CA3AF",
    marginBottom: 4,
  },
  profitAmount: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#00D4AA",
  },
  opportunityCard: {
    backgroundColor: "#1F2937",
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#374151",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  tokenPair: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  profitBadge: {
    backgroundColor: "#00D4AA",
    color: "#FFFFFF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    fontSize: 12,
    fontWeight: "600",
  },
  cardBody: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  exchangeInfo: {
    flex: 1,
    alignItems: "center",
  },
  exchangeLabel: {
    fontSize: 12,
    color: "#9CA3AF",
    marginBottom: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  volume: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  tradeButton: {
    backgroundColor: "#00D4AA",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  tradeButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
});