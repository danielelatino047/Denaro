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
          const stored = await AsyncStorage.getItem('app-settings');
          if (stored) {
            const parsedSettings = JSON.parse(stored);
            set({ settings: parsedSettings });
          }
        } catch (error) {
          console.error('Error loading settings:', error);
        }
      },
    })
  )
);