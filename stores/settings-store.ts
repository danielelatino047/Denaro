import { create } from "zustand";
import { combine } from "zustand/middleware";
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ExchangeApiKeys {
  apiKey?: string;
  apiSecret?: string;
}

export interface Settings {
  minProfitPercentage: number;
  maxSlippage: number;
  maxTradeAmount: number;
  isLiveMode: boolean;
  autoRefresh: boolean;
  notifications: {
    trades: boolean;
    profits: boolean;
  };
  apiKeys: {
    // Only 3 exchanges for live mode
    binance?: ExchangeApiKeys;
    kucoin?: ExchangeApiKeys;
    bybit?: ExchangeApiKeys;
    // Configuration status
    configured?: boolean;
  };
  // WalletConnect settings
  walletConnect: {
    enabled: boolean;
    connectedAddress?: string;
  };
}

export const useSettingsStore = create(
  combine(
    {
      settings: {
        minProfitPercentage: 0.5,
        maxSlippage: 1.0,
        maxTradeAmount: 1000,
        isLiveMode: false,
        autoRefresh: true,
        notifications: {
          trades: true,
          profits: true,
        },
        apiKeys: {
          configured: false,
        },
        walletConnect: {
          enabled: false,
        },
      } as Settings,
    },
    (set, get) => ({
      updateSettings: async (newSettings: Partial<Settings>) => {
        const { settings } = get();
        const updatedSettings = { ...settings, ...newSettings };
        set({ settings: updatedSettings });
        
        // Persist settings to AsyncStorage
        try {
          await AsyncStorage.setItem('app-settings', JSON.stringify(updatedSettings));
        } catch (error) {
          console.error('Error saving settings:', error);
        }
      },
      
      loadSettings: async () => {
        try {
          console.log('Loading settings...');
          const stored = await AsyncStorage.getItem('app-settings');
          
          if (stored && stored.trim()) {
            try {
              const parsedSettings = JSON.parse(stored);
              
              // Validate settings structure
              if (parsedSettings && typeof parsedSettings === 'object') {
                const { settings } = get();
                const validatedSettings = {
                  ...settings,
                  ...parsedSettings,
                  // Ensure required nested objects exist
                  notifications: {
                    ...settings.notifications,
                    ...(parsedSettings.notifications || {})
                  },
                  apiKeys: {
                    ...settings.apiKeys,
                    ...(parsedSettings.apiKeys || {})
                  },
                  walletConnect: {
                    ...settings.walletConnect,
                    ...(parsedSettings.walletConnect || {})
                  }
                };
                
                set({ settings: validatedSettings });
                console.log('Settings loaded successfully');
              } else {
                console.log('Invalid settings format, using defaults');
              }
            } catch (parseError) {
              console.error('Error parsing settings:', parseError);
              // Clear corrupted settings
              await AsyncStorage.removeItem('app-settings');
            }
          } else {
            console.log('No stored settings found, using defaults');
          }
        } catch (error) {
          console.error('Critical error loading settings:', error);
        }
      },
    })
  )
);