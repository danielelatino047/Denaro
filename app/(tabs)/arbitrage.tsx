import React, { useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { useArbitrageStore } from "@/stores/arbitrage-store";
import { ArbitrageCard } from "@/components/ArbitrageCard";
import { ProfitSummary } from "@/components/ProfitSummary";
import { OpportunityScanner } from "@/components/OpportunityScanner";
import { useSettingsStore } from "@/stores/settings-store";
import ComponentErrorBoundary from "@/components/ComponentErrorBoundary";

export default function ArbitrageScreen() {
  const { 
    opportunities, 
    isLoading, 
    refreshOpportunities, 
    totalProfit, 
    isLiveMode, 
    startLiveUpdates, 
    stopLiveUpdates,
    lastUpdateTime,
    wsConnected 
  } = useArbitrageStore();
  const { settings } = useSettingsStore();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    // Only start live updates if in live mode
    if (settings.isLiveMode) {
      console.log('🔴 Live mode enabled - starting live updates');
      startLiveUpdates();
    } else {
      console.log('🟡 Demo mode - stopping live updates');
      stopLiveUpdates();
    }
    
    // Cleanup on unmount
    return () => {
      stopLiveUpdates();
    };
  }, [settings.isLiveMode, startLiveUpdates, stopLiveUpdates]);
  
  const handleManualRefresh = () => {
    refreshOpportunities();
  };
  
  const toggleLiveMode = () => {
    if (isLiveMode) {
      stopLiveUpdates();
    } else {
      startLiveUpdates();
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
        <OpportunityScanner 
          isScanning={isLoading || isLiveMode}
          opportunityCount={opportunities.length}
          isLiveMode={settings.isLiveMode}
        />
      </ComponentErrorBoundary>
      
      <ComponentErrorBoundary componentName="ProfitSummary">
        <ProfitSummary totalProfit={totalProfit} />
      </ComponentErrorBoundary>

      <ScrollView
        style={styles.scrollView}
        {...(Platform.OS !== 'web' && {
          refreshControl: (
            <RefreshControl
              refreshing={isLoading}
              onRefresh={handleManualRefresh}
              tintColor="#00D4AA"
            />
          )
        })}
      >
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
                {opportunities.length} {settings.isLiveMode ? 'Live' : 'Demo'} Opportunities
              </Text>
              <Text style={styles.opportunitySubtext}>
                Sorted by net profit (after fees) • {wsConnected ? 'WebSocket' : isLiveMode ? 'REST API' : 'Manual'} • {settings.isLiveMode ? 'Real Trading' : 'Simulation'}
              </Text>
            </View>
            {opportunities.map((opportunity) => (
              <ComponentErrorBoundary 
                key={`${opportunity.tokenPair}-${opportunity.buyExchange}-${opportunity.sellExchange}`}
                componentName="ArbitrageCard"
              >
                <ArbitrageCard
                  opportunity={opportunity}
                />
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
  spinning: {
    transform: [{ rotate: "180deg" }],
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
});