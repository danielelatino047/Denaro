import { create } from "zustand";
import { combine } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Balance {
  symbol: string;
  amount: number;
  usdValue: number;
  change24h: number;
}

export interface Transaction {
  id: string;
  type: "buy" | "sell" | "arbitrage";
  tokenPair: string;
  amount: number;
  price: number;
  usdtAmount: number; // Amount in USDT that was traded
  profit?: number;
  timestamp: Date;
  status: "completed" | "pending" | "failed";
  exchange?: string;
  // Additional arbitrage details
  buyExchange?: string;
  sellExchange?: string;
  buyPrice?: number;
  sellPrice?: number;
  profitPercentage?: number;
}



const STORAGE_KEY = "portfolio_data";

const initialBalances: Balance[] = [
  { symbol: "USDT", amount: 10000.00, usdValue: 10000.00, change24h: 0 },
  { symbol: "BTC", amount: 0, usdValue: 0, change24h: 0 },
  { symbol: "ETH", amount: 0, usdValue: 0, change24h: 0 },
  { symbol: "BNB", amount: 0, usdValue: 0, change24h: 0 },
  { symbol: "SOL", amount: 0, usdValue: 0, change24h: 0 },
  { symbol: "ADA", amount: 0, usdValue: 0, change24h: 0 },
  { symbol: "XRP", amount: 0, usdValue: 0, change24h: 0 },
  { symbol: "DOT", amount: 0, usdValue: 0, change24h: 0 },
  { symbol: "DOGE", amount: 0, usdValue: 0, change24h: 0 },
  { symbol: "AVAX", amount: 0, usdValue: 0, change24h: 0 },
  { symbol: "MATIC", amount: 0, usdValue: 0, change24h: 0 },
  { symbol: "LINK", amount: 0, usdValue: 0, change24h: 0 },
  { symbol: "UNI", amount: 0, usdValue: 0, change24h: 0 },
  { symbol: "ATOM", amount: 0, usdValue: 0, change24h: 0 },
  { symbol: "LTC", amount: 0, usdValue: 0, change24h: 0 },
  { symbol: "FIL", amount: 0, usdValue: 0, change24h: 0 },
  { symbol: "AAVE", amount: 0, usdValue: 0, change24h: 0 },
  { symbol: "XLM", amount: 0, usdValue: 0, change24h: 0 },
  { symbol: "VET", amount: 0, usdValue: 0, change24h: 0 },
  { symbol: "TRX", amount: 0, usdValue: 0, change24h: 0 },
  { symbol: "SHIB", amount: 0, usdValue: 0, change24h: 0 },
  { symbol: "ICP", amount: 0, usdValue: 0, change24h: 0 },
  { symbol: "APT", amount: 0, usdValue: 0, change24h: 0 },
  { symbol: "ARB", amount: 0, usdValue: 0, change24h: 0 },
  { symbol: "OP", amount: 0, usdValue: 0, change24h: 0 },
  { symbol: "INJ", amount: 0, usdValue: 0, change24h: 0 },
  { symbol: "SUI", amount: 0, usdValue: 0, change24h: 0 },
  { symbol: "PEPE", amount: 0, usdValue: 0, change24h: 0 },
  { symbol: "FTM", amount: 0, usdValue: 0, change24h: 0 },
  { symbol: "NEAR", amount: 0, usdValue: 0, change24h: 0 },
  { symbol: "ALGO", amount: 0, usdValue: 0, change24h: 0 },
];

export const usePortfolioStore = create(
  combine(
    {
      balances: initialBalances,
      totalValue: initialBalances.reduce((sum, balance) => sum + balance.usdValue, 0),
      dailyPnL: 0,
      transactions: [] as Transaction[],
      lastUpdated: new Date(),
      isInitialized: false,
    },
    (set, get) => ({
      initializePortfolio: async () => {
        try {
          const stored = await AsyncStorage.getItem(STORAGE_KEY);
          if (stored) {
            const data = JSON.parse(stored);
            set({
              ...data,
              transactions: data.transactions.map((t: any) => ({
                ...t,
                timestamp: new Date(t.timestamp)
              })),
              lastUpdated: new Date(data.lastUpdated),
              isInitialized: true,
            });
          } else {
            set({ isInitialized: true });
          }
          
          // Sync with wallet store USDT balance
          setTimeout(async () => {
            try {
              const { useWalletStore } = await import('./wallet-store');
              const walletState = useWalletStore.getState();
              if (walletState.isInitialized) {
                const { balances } = get();
                const usdtBalance = balances.find(b => b.symbol === 'USDT');
                if (usdtBalance && usdtBalance.amount !== walletState.usdtBalance) {
                  console.log('Syncing portfolio USDT with wallet:', walletState.usdtBalance);
                  usePortfolioStore.getState().updateBalance('USDT', walletState.usdtBalance, walletState.usdtBalance);
                }
              }
            } catch (error) {
              console.error('Error syncing with wallet store:', error);
            }
          }, 100);
        } catch (error) {
          console.error("Error initializing portfolio:", error);
          set({ isInitialized: true });
        }
      },

      saveToStorage: async () => {
        const state = get();
        try {
          await AsyncStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
              balances: state.balances,
              totalValue: state.totalValue,
              dailyPnL: state.dailyPnL,
              transactions: state.transactions,
              lastUpdated: state.lastUpdated,
            })
          );
        } catch (error) {
          console.error("Error saving portfolio data:", error);
        }
      },

      updateBalance: (symbol: string, amount: number, usdValue: number) => {
        const { balances } = get();
        let updatedBalances = balances.map(balance => 
          balance.symbol === symbol 
            ? { ...balance, amount, usdValue }
            : balance
        );
        
        // If coin doesn't exist in balances, add it
        if (!updatedBalances.find(b => b.symbol === symbol)) {
          updatedBalances.push({
            symbol,
            amount,
            usdValue,
            change24h: 0
          });
        }
        
        const newTotalValue = updatedBalances.reduce((sum, balance) => sum + balance.usdValue, 0);
        set({ 
          balances: updatedBalances, 
          totalValue: newTotalValue,
          lastUpdated: new Date()
        });
        
        // Save to storage
        setTimeout(() => {
          (get() as any).saveToStorage();
        }, 100);
      },
      
      addTransaction: (transaction: Omit<Transaction, 'id'>) => {
        const { transactions } = get();
        const newTransaction = {
          ...transaction,
          id: Date.now().toString(),
        };
        set({ transactions: [newTransaction, ...transactions] });
        
        // Save to storage
        setTimeout(() => {
          (get() as any).saveToStorage();
        }, 100);
      },
      
      resetDemoBalance: async (customAmount?: number) => {
        const resetAmount = customAmount || 5000;
        console.log(`Resetting demo balance to ${resetAmount} USDT`);
        
        const resetBalances = initialBalances.map(balance => 
          balance.symbol === 'USDT' 
            ? { ...balance, amount: resetAmount, usdValue: resetAmount }
            : { ...balance }
        );
        
        set({ 
          balances: resetBalances,
          totalValue: resetAmount,
          dailyPnL: 0,
          transactions: [],
          lastUpdated: new Date()
        });
        
        // Update wallet store with new balance
        try {
          const { useWalletStore } = await import('./wallet-store');
          const walletStore = useWalletStore.getState();
          await walletStore.updateUSDTBalance(resetAmount);
        } catch (error) {
          console.error('Error syncing reset balance with wallet:', error);
        }
        
        // Clear storage
        try {
          await AsyncStorage.removeItem(STORAGE_KEY);
        } catch (error) {
          console.error("Error clearing portfolio data:", error);
        }
      },
    })
  )
);