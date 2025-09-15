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
          console.log('Initializing portfolio store...');
          const stored = await AsyncStorage.getItem(STORAGE_KEY);
          
          if (stored && stored.trim()) {
            try {
              const data = JSON.parse(stored);
              
              // Validate data structure
              if (data && typeof data === 'object') {
                const validatedData = {
                  balances: Array.isArray(data.balances) ? data.balances : initialBalances,
                  totalValue: typeof data.totalValue === 'number' ? data.totalValue : 0,
                  dailyPnL: typeof data.dailyPnL === 'number' ? data.dailyPnL : 0,
                  transactions: Array.isArray(data.transactions) ? data.transactions.map((t: any) => {
                    try {
                      return {
                        ...t,
                        timestamp: t.timestamp ? new Date(t.timestamp) : new Date()
                      };
                    } catch {
                      return { ...t, timestamp: new Date() };
                    }
                  }) : [],
                  lastUpdated: data.lastUpdated ? new Date(data.lastUpdated) : new Date(),
                  isInitialized: true,
                };
                
                set(validatedData);
                console.log('Portfolio data loaded from storage');
              } else {
                throw new Error('Invalid data structure');
              }
            } catch (parseError) {
              console.error('Error parsing stored portfolio data:', parseError);
              // Clear corrupted data and use defaults
              await AsyncStorage.removeItem(STORAGE_KEY);
              set({ 
                balances: initialBalances,
                totalValue: initialBalances.reduce((sum, balance) => sum + balance.usdValue, 0),
                isInitialized: true 
              });
            }
          } else {
            console.log('No stored portfolio data, using defaults');
            set({ 
              balances: initialBalances,
              totalValue: initialBalances.reduce((sum, balance) => sum + balance.usdValue, 0),
              isInitialized: true 
            });
          }
          
        } catch (error) {
          console.error("Critical error initializing portfolio:", error);
          // Fallback to safe defaults
          set({ 
            balances: initialBalances,
            totalValue: initialBalances.reduce((sum, balance) => sum + balance.usdValue, 0),
            dailyPnL: 0,
            transactions: [],
            lastUpdated: new Date(),
            isInitialized: true 
          });
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
        
        // Save to storage with error handling
        setTimeout(() => {
          try {
            usePortfolioStore.getState().saveToStorage().catch((error: any) => {
              console.error('Error saving portfolio to storage:', error);
            });
          } catch (error) {
            console.error('Error accessing saveToStorage:', error);
          }
        }, 100);
      },
      
      addTransaction: (transaction: Omit<Transaction, 'id'>) => {
        const { transactions } = get();
        const newTransaction = {
          ...transaction,
          id: Date.now().toString(),
        };
        set({ transactions: [newTransaction, ...transactions] });
        
        // Save to storage with error handling
        setTimeout(() => {
          try {
            usePortfolioStore.getState().saveToStorage().catch((error: any) => {
              console.error('Error saving portfolio to storage:', error);
            });
          } catch (error) {
            console.error('Error accessing saveToStorage:', error);
          }
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
        
        // Wallet sync disabled to avoid circular imports
        console.log('Wallet sync disabled - avoiding circular imports');
        
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