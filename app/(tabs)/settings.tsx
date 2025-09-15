import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
  Alert,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { useSettingsStore } from "@/stores/settings-store";
import { usePortfolioStore } from "@/stores/portfolio-store";
import { useWalletStore } from "@/stores/wallet-store";
import ErrorDebugModal from "@/components/ErrorDebugModal";

export default function SettingsScreen() {
  const { settings, updateSettings, loadSettings } = useSettingsStore();
  const { resetDemoBalance } = usePortfolioStore();
  const { updateUSDTBalance } = useWalletStore();
  const insets = useSafeAreaInsets();
  const [showApiModal, setShowApiModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showErrorDebug, setShowErrorDebug] = useState(false);
  const [customBalance, setCustomBalance] = useState("10000");
  
  React.useEffect(() => {
    loadSettings();
  }, []);
  
  const handleResetBalance = () => {
    setShowResetModal(true);
  };

  const confirmResetBalance = async () => {
    const amount = parseFloat(customBalance);
    if (isNaN(amount) || amount < 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid positive number');
      return;
    }
    
    await resetDemoBalance(amount);
    setShowResetModal(false);
    Alert.alert('Success', `Demo balance has been reset to ${amount} USDT`);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="warning" color={settings.isLiveMode ? "#EF4444" : "#00D4AA"} size={20} />
            <Text style={styles.sectionTitle}>Trading Mode</Text>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.modeContainer}>
              <Text style={styles.settingLabel}>
                {settings.isLiveMode ? 'Live Trading' : 'Demo Mode'}
              </Text>
              <Text style={[styles.modeDescription, settings.isLiveMode ? styles.liveMode : styles.demoMode]}>
                {settings.isLiveMode 
                  ? 'Real money trades with Binance, Bybit & KuCoin' 
                  : 'Practice with virtual funds (10000 USDT)'
                }
              </Text>
            </View>
            <Switch
              value={settings.isLiveMode}
              onValueChange={(value) => {
                if (value && !settings.apiKeys?.configured && !settings.walletConnect.enabled) {
                  Alert.alert(
                    'Configuration Required',
                    'Please configure either API keys or WalletConnect before enabling live trading.',
                    [
                      { text: 'Configure', onPress: () => setShowApiModal(true) },
                      { text: 'Cancel', style: 'cancel' }
                    ]
                  );
                } else if (value) {
                  Alert.alert(
                    'Enable Live Trading',
                    'Live trading will use real funds. Make sure you understand the risks.',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { 
                        text: 'Enable', 
                        style: 'destructive',
                        onPress: () => updateSettings({ isLiveMode: true })
                      }
                    ]
                  );
                } else {
                  updateSettings({ isLiveMode: false });
                }
              }}
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
            <TextInput
              style={styles.input}
              value={settings.minProfitPercentage.toString()}
              onChangeText={(text) =>
                updateSettings({ minProfitPercentage: parseFloat(text) || 0 })
              }
              keyboardType="numeric"
              placeholder="0.5"
              placeholderTextColor="#6B7280"
            />
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Max Slippage (%)</Text>
            <TextInput
              style={styles.input}
              value={settings.maxSlippage.toString()}
              onChangeText={(text) =>
                updateSettings({ maxSlippage: parseFloat(text) || 0 })
              }
              keyboardType="numeric"
              placeholder="1.0"
              placeholderTextColor="#6B7280"
            />
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Max Trade Amount (USDT)</Text>
            <TextInput
              style={styles.input}
              value={settings.maxTradeAmount.toString()}
              onChangeText={(text) =>
                updateSettings({ maxTradeAmount: parseFloat(text) || 0 })
              }
              keyboardType="numeric"
              placeholder="1000"
              placeholderTextColor="#6B7280"
            />
          </View>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Auto-Refresh Live Data</Text>
            <Switch
              value={settings.autoRefresh}
              onValueChange={(value) => updateSettings({ autoRefresh: value })}
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
              value={settings.notifications.trades}
              onValueChange={(value) =>
                updateSettings({
                  notifications: { ...settings.notifications, trades: value },
                })
              }
              trackColor={{ false: "#374151", true: "#00D4AA" }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Profit Alerts</Text>
            <Switch
              value={settings.notifications.profits}
              onValueChange={(value) =>
                updateSettings({
                  notifications: { ...settings.notifications, profits: value },
                })
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
            disabled={settings.isLiveMode}
          >
            <MaterialIcons name="refresh" color={settings.isLiveMode ? "#6B7280" : "#EF4444"} size={16} />
            <Text style={[styles.settingButtonText, settings.isLiveMode && styles.disabledText]}>
              Reset Demo Balance
            </Text>
          </TouchableOpacity>
          
          {settings.isLiveMode && (
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

          <TouchableOpacity 
            style={styles.settingButton}
            onPress={() => setShowApiModal(true)}
          >
            <View style={styles.buttonContent}>
              <MaterialIcons name="vpn-key" color="#00D4AA" size={20} />
              <Text style={styles.settingButtonText}>Configure Live Mode</Text>
              {(settings.apiKeys?.configured || settings.walletConnect.enabled) && (
                <View style={styles.configuredBadge}>
                  <Text style={styles.configuredText}>Ready</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingButton}>
            <Text style={styles.settingButtonText}>Export Trading History</Text>
          </TouchableOpacity>
        </View>
        
        {__DEV__ && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="bug-report" color="#EF4444" size={20} />
              <Text style={styles.sectionTitle}>Developer Tools</Text>
            </View>

            <TouchableOpacity 
              style={[styles.settingButton, styles.debugButton]}
              onPress={() => setShowErrorDebug(true)}
            >
              <View style={styles.buttonContent}>
                <MaterialIcons name="bug-report" color="#EF4444" size={20} />
                <Text style={[styles.settingButtonText, styles.debugButtonText]}>Error Debug Console</Text>
              </View>
            </TouchableOpacity>
            
            <Text style={styles.debugNote}>
              View JavaScript errors and debugging information (Development Mode only)
            </Text>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={showApiModal}
        animationType="slide"
        transparent={false}
      >
        <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Live Mode Configuration</Text>
            <TouchableOpacity onPress={() => setShowApiModal(false)}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.infoBox}>
              <MaterialIcons name="info" color="#00D4AA" size={20} />
              <Text style={styles.infoText}>
                Configure exchange APIs for direct trading or enable WalletConnect for decentralized execution
              </Text>
            </View>

            <View style={styles.apiSection}>
              <Text style={styles.apiSectionTitle}>Exchange APIs</Text>
              <Text style={styles.apiDescription}>
                Connect directly to exchanges for fastest execution
              </Text>
              
              {[
                { name: 'Binance', key: 'binance' as const },
                { name: 'KuCoin', key: 'kucoin' as const },
                { name: 'Bybit', key: 'bybit' as const },
              ].map((exchange) => (
                <View key={exchange.key} style={styles.apiItem}>
                  <Text style={styles.apiLabel}>{exchange.name}</Text>
                  <TextInput
                    style={styles.apiKeyInput}
                    placeholder="API Key"
                    value={settings.apiKeys?.[exchange.key]?.apiKey || ''}
                    onChangeText={(text) => updateSettings({
                      apiKeys: {
                        ...settings.apiKeys,
                        [exchange.key]: {
                          ...settings.apiKeys?.[exchange.key],
                          apiKey: text
                        }
                      }
                    })}
                    secureTextEntry
                    placeholderTextColor="#6B7280"
                  />
                  <TextInput
                    style={styles.apiSecretInput}
                    placeholder="API Secret"
                    value={settings.apiKeys?.[exchange.key]?.apiSecret || ''}
                    onChangeText={(text) => updateSettings({
                      apiKeys: {
                        ...settings.apiKeys,
                        [exchange.key]: {
                          ...settings.apiKeys?.[exchange.key],
                          apiSecret: text
                        }
                      }
                    })}
                    secureTextEntry
                    placeholderTextColor="#6B7280"
                  />
                </View>
              ))}
            </View>

            <View style={styles.divider} />

            <View style={styles.apiSection}>
              <Text style={styles.apiSectionTitle}>Wallet / Execution</Text>
              <Text style={styles.apiDescription}>
                Connect your wallet for decentralized trading
              </Text>
              
              <View style={styles.settingItem}>
                <View style={styles.walletInfo}>
                  <Ionicons name="wallet" color="#00D4AA" size={20} />
                  <View style={styles.walletTextContainer}>
                    <Text style={styles.settingLabel}>WalletConnect</Text>
                    {settings.walletConnect.connectedAddress && (
                      <Text style={styles.walletAddress}>
                        {settings.walletConnect.connectedAddress.slice(0, 6)}...
                        {settings.walletConnect.connectedAddress.slice(-4)}
                      </Text>
                    )}
                  </View>
                </View>
                <Switch
                  value={settings.walletConnect.enabled}
                  onValueChange={(value) => {
                    if (value) {
                      // Here you would integrate WalletConnect SDK
                      Alert.alert(
                        'WalletConnect',
                        'WalletConnect integration will be available soon. Use Exchange APIs for now.',
                        [{ text: 'OK' }]
                      );
                      updateSettings({
                        walletConnect: {
                          ...settings.walletConnect,
                          enabled: false
                        }
                      });
                    } else {
                      updateSettings({
                        walletConnect: {
                          enabled: false,
                          connectedAddress: undefined
                        }
                      });
                    }
                  }}
                  trackColor={{ false: "#374151", true: "#00D4AA" }}
                  thumbColor="#FFFFFF"
                />
              </View>
              
              <Text style={styles.walletNote}>
                When enabled, execute swaps directly from your connected wallet
              </Text>
            </View>

            {settings.isLiveMode && (
              <View style={styles.warningBox}>
                <MaterialIcons name="warning" color="#EF4444" size={20} />
                <Text style={styles.warningText}>
                  Live trading is enabled. These credentials will be used for real transactions.
                </Text>
              </View>
            )}

            <View style={styles.noteBox}>
              <Text style={styles.noteTitle}>Demo Mode Info:</Text>
              <Text style={styles.noteText}>
                Demo mode uses the same Binance, Bybit, and KuCoin data sources but simulates trades with virtual USDT
              </Text>
            </View>
          </ScrollView>

          <TouchableOpacity 
            style={styles.saveButton}
            onPress={() => {
              const hasApiKeys = ['binance', 'kucoin', 'bybit'].some(
                key => {
                  const apiConfig = settings.apiKeys?.[key as 'binance' | 'kucoin' | 'bybit'];
                  return apiConfig && typeof apiConfig === 'object' && apiConfig.apiKey;
                }
              );
              
              updateSettings({ 
                apiKeys: {
                  ...settings.apiKeys,
                  configured: hasApiKeys
                }
              });
              
              Alert.alert(
                'Configuration Saved', 
                hasApiKeys || settings.walletConnect.enabled
                  ? 'Your configuration has been saved. You can now enable live trading.'
                  : 'Configuration saved. Add API keys or connect wallet to enable live trading.'
              );
              setShowApiModal(false);
            }}
          >
            <Text style={styles.saveButtonText}>Save Configuration</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <Modal
        visible={showResetModal}
        animationType="fade"
        transparent={true}
      >
        <View style={styles.resetModalOverlay}>
          <View style={styles.resetModalContainer}>
            <View style={styles.resetModalHeader}>
              <Text style={styles.resetModalTitle}>Reset Demo Balance</Text>
              <TouchableOpacity onPress={() => setShowResetModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.resetModalDescription}>
              Enter the amount of USDT you want in your demo account:
            </Text>
            
            <TextInput
              style={styles.resetModalInput}
              value={customBalance}
              onChangeText={setCustomBalance}
              keyboardType="numeric"
              placeholder="10000"
              placeholderTextColor="#6B7280"
              autoFocus
            />
            
            <Text style={styles.resetModalWarning}>
              This will clear all transaction history and reset your balance.
            </Text>
            
            <View style={styles.resetModalButtons}>
              <TouchableOpacity 
                style={styles.resetModalCancelButton}
                onPress={() => setShowResetModal(false)}
              >
                <Text style={styles.resetModalCancelText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.resetModalConfirmButton}
                onPress={confirmResetBalance}
              >
                <Text style={styles.resetModalConfirmText}>Reset Balance</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      <ErrorDebugModal 
        visible={showErrorDebug}
        onClose={() => setShowErrorDebug(false)}
      />
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
  input: {
    backgroundColor: "#374151",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: "#FFFFFF",
    fontSize: 16,
    minWidth: 100,
    textAlign: "right",
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