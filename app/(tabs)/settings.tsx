import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Switch,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [notifications, setNotifications] = useState({
    trades: true,
    profits: true,
  });

  const handleResetBalance = () => {
    console.log('Reset balance requested');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="warning" color={isLiveMode ? "#EF4444" : "#00D4AA"} size={20} />
            <Text style={styles.sectionTitle}>Trading Mode</Text>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.modeContainer}>
              <Text style={styles.settingLabel}>
                {isLiveMode ? 'Live Trading' : 'Demo Mode'}
              </Text>
              <Text style={[styles.modeDescription, isLiveMode ? styles.liveMode : styles.demoMode]}>
                {isLiveMode 
                  ? 'Real money trades with Binance, Bybit & KuCoin' 
                  : 'Practice with virtual funds (10000 USDT)'
                }
              </Text>
            </View>
            <Switch
              value={isLiveMode}
              onValueChange={setIsLiveMode}
              trackColor={{ false: "#00D4AA", true: "#EF4444" }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="flash" color="#00D4AA" size={20} />
            <Text style={styles.sectionTitle}>Trading Parameters</Text>
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Minimum Profit (%)</Text>
            <Text style={styles.settingValue}>0.5%</Text>
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Max Slippage (%)</Text>
            <Text style={styles.settingValue}>1.0%</Text>
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Max Trade Amount (USDT)</Text>
            <Text style={styles.settingValue}>1000</Text>
          </View>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Auto-Refresh Live Data</Text>
            <Switch
              value={autoRefresh}
              onValueChange={setAutoRefresh}
              trackColor={{ false: "#374151", true: "#00D4AA" }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="notifications" color="#00D4AA" size={20} />
            <Text style={styles.sectionTitle}>Notifications</Text>
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Trade Notifications</Text>
            <Switch
              value={notifications.trades}
              onValueChange={(value) =>
                setNotifications({ ...notifications, trades: value })
              }
              trackColor={{ false: "#374151", true: "#00D4AA" }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Profit Alerts</Text>
            <Switch
              value={notifications.profits}
              onValueChange={(value) =>
                setNotifications({ ...notifications, profits: value })
              }
              trackColor={{ false: "#374151", true: "#00D4AA" }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="refresh" color="#00D4AA" size={20} />
            <Text style={styles.sectionTitle}>Demo Account</Text>
          </View>

          <TouchableOpacity 
            style={[styles.settingButton, styles.resetButton]} 
            onPress={handleResetBalance}
            disabled={isLiveMode}
          >
            <MaterialIcons name="refresh" color={isLiveMode ? "#6B7280" : "#EF4444"} size={16} />
            <Text style={[styles.settingButtonText, isLiveMode && styles.disabledText]}>
              Reset Demo Balance
            </Text>
          </TouchableOpacity>
          
          {isLiveMode && (
            <Text style={styles.disabledNote}>
              Demo reset is only available in Demo Mode
            </Text>
          )}
        </View>
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="security" color="#00D4AA" size={20} />
            <Text style={styles.sectionTitle}>Live Mode Configuration</Text>
          </View>

          <TouchableOpacity style={styles.settingButton}>
            <View style={styles.buttonContent}>
              <MaterialIcons name="vpn-key" color="#00D4AA" size={20} />
              <Text style={styles.settingButtonText}>Configure Live Mode</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingButton}>
            <Text style={styles.settingButtonText}>Export Trading History</Text>
          </TouchableOpacity>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#374151",
  },
  settingLabel: {
    fontSize: 16,
    color: "#FFFFFF",
    flex: 1,
  },
  settingValue: {
    fontSize: 16,
    color: "#9CA3AF",
    fontWeight: "500" as const,
  },
  settingButton: {
    backgroundColor: "#1F2937",
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  settingButtonText: {
    fontSize: 16,
    color: "#00D4AA",
    fontWeight: "600",
  },
  modeContainer: {
    flex: 1,
  },
  modeDescription: {
    fontSize: 12,
    marginTop: 4,
  },
  demoMode: {
    color: "#00D4AA",
  },
  liveMode: {
    color: "#EF4444",
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#1F2937",
  },
  disabledText: {
    color: "#6B7280",
  },
  disabledNote: {
    fontSize: 12,
    color: "#6B7280",
    fontStyle: "italic",
    marginTop: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#111827",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#1F2937",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  apiSection: {
    marginBottom: 30,
  },
  apiSectionTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#00D4AA",
    marginBottom: 8,
  },
  apiDescription: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 15,
  },
  apiItem: {
    marginBottom: 20,
  },
  apiLabel: {
    fontSize: 14,
    color: "#D1D5DB",
    marginBottom: 8,
  },
  apiKeyInput: {
    backgroundColor: "#1F2937",
    borderRadius: 8,
    padding: 12,
    color: "#FFFFFF",
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#374151",
    marginBottom: 8,
  },
  apiSecretInput: {
    backgroundColor: "#1F2937",
    borderRadius: 8,
    padding: 12,
    color: "#FFFFFF",
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#374151",
  },
  warningBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#7F1D1D",
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  warningText: {
    fontSize: 14,
    color: "#FCA5A5",
    marginLeft: 10,
    flex: 1,
  },
  saveButton: {
    backgroundColor: "#00D4AA",
    padding: 16,
    borderRadius: 12,
    margin: 20,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "600" as const,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  configuredBadge: {
    backgroundColor: "#00D4AA",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: "auto",
  },
  configuredText: {
    fontSize: 10,
    color: "#111827",
    fontWeight: "600" as const,
  },
  divider: {
    height: 1,
    backgroundColor: "#374151",
    marginVertical: 20,
  },
  walletInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  walletTextContainer: {
    flex: 1,
  },
  walletAddress: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  walletNote: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 8,
    fontStyle: "italic",
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1F2937",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    gap: 12,
  },
  infoText: {
    fontSize: 14,
    color: "#D1D5DB",
    flex: 1,
  },
  noteBox: {
    backgroundColor: "#1F2937",
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#00D4AA",
    marginBottom: 5,
  },
  noteText: {
    fontSize: 13,
    color: "#9CA3AF",
  },
  resetModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  resetModalContainer: {
    backgroundColor: "#1F2937",
    borderRadius: 16,
    padding: 20,
    width: "100%",
    maxWidth: 400,
  },
  resetModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  resetModalTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  resetModalDescription: {
    fontSize: 14,
    color: "#D1D5DB",
    marginBottom: 16,
  },
  resetModalInput: {
    backgroundColor: "#111827",
    borderRadius: 8,
    padding: 12,
    color: "#FFFFFF",
    fontSize: 18,
    borderWidth: 1,
    borderColor: "#374151",
    marginBottom: 16,
    textAlign: "center",
  },
  resetModalWarning: {
    fontSize: 12,
    color: "#EF4444",
    fontStyle: "italic",
    marginBottom: 20,
    textAlign: "center",
  },
  resetModalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  resetModalCancelButton: {
    flex: 1,
    backgroundColor: "#374151",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  resetModalCancelText: {
    color: "#D1D5DB",
    fontSize: 14,
    fontWeight: "600" as const,
  },
  resetModalConfirmButton: {
    flex: 1,
    backgroundColor: "#EF4444",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  resetModalConfirmText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600" as const,
  },
  debugButton: {
    backgroundColor: "#450A0A",
    borderWidth: 1,
    borderColor: "#EF4444",
  },
  debugButtonText: {
    color: "#EF4444",
  },
  debugNote: {
    fontSize: 12,
    color: "#6B7280",
    fontStyle: "italic",
    marginTop: 8,
  },
});