import { create } from "zustand";
import { combine } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface WalletAddress {
  coin: string;
  network: string;
  address: string;
  qrCode?: string;
}

export interface DepositHistory {
  id: string;
  amount: number;
  txHash: string;
  status: "pending" | "confirmed" | "failed";
  timestamp: Date;
  network: string;
}

export interface WithdrawalHistory {
  id: string;
  amount: number;
  address: string;
  txHash?: string;
  status: "pending" | "processing" | "completed" | "failed";
  timestamp: Date;
  network: string;
  fee: number;
}

// Generate USDT wallet addresses for different networks
const generateUSDTAddresses = (): WalletAddress[] => {
  const networks = [
    { network: "ERC-20 (Ethereum)", prefix: "0x" },
    { network: "TRC-20 (Tron)", prefix: "T" },
    { network: "BEP-20 (BSC)", prefix: "0x" },
  ];

  return networks.map(({ network, prefix }) => {
    // Generate realistic-looking addresses
    const randomHex = () => Math.random().toString(16).substring(2, 10);
    let address = prefix;
    
    if (prefix === "0x") {
      address += randomHex() + randomHex() + randomHex() + randomHex() + randomHex();
    } else if (prefix === "T") {
      address += randomHex().toUpperCase() + randomHex().toUpperCase() + randomHex().toUpperCase();
    }

    return {
      coin: "USDT",
      network,
      address,
      qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${address}`
    };
  });
};

const STORAGE_KEY = "wallet_data_usdt";

export const useWalletStore = create(
  combine(
    {
      walletAddresses: [] as WalletAddress[],
      depositHistory: [] as DepositHistory[],
      withdrawalHistory: [] as WithdrawalHistory[],
      totalDeposited: 0,
      totalWithdrawn: 0,
      isInitialized: false,
      usdtBalance: 10000, // Starting balance in USDT
    },
    (set, get) => ({
      initializeWallet: async () => {
        try {
          const stored = await AsyncStorage.getItem(STORAGE_KEY);
          if (stored) {
            const data = JSON.parse(stored);
            set({
              ...data,
              depositHistory: data.depositHistory.map((d: any) => ({
                ...d,
                timestamp: new Date(d.timestamp)
              })),
              withdrawalHistory: data.withdrawalHistory.map((w: any) => ({
                ...w,
                timestamp: new Date(w.timestamp)
              })),
              isInitialized: true,
            });
            
            // Sync wallet balance with portfolio after loading
            setTimeout(async () => {
              try {
                const { usePortfolioStore } = await import('./portfolio-store');
                const portfolioStore = usePortfolioStore.getState();
                if (portfolioStore.isInitialized) {
                  const { usdtBalance } = get();
                  console.log('Syncing wallet balance with portfolio on init:', usdtBalance);
                  portfolioStore.updateBalance('USDT', usdtBalance, usdtBalance);
                }
              } catch (error) {
                console.error('Error syncing wallet with portfolio on init:', error);
              }
            }, 200);
          } else {
            // Initialize with generated USDT addresses
            const addresses = generateUSDTAddresses();
            set({
              walletAddresses: addresses,
              isInitialized: true,
            });
            await (get() as any).saveToStorage();
          }
        } catch (error) {
          console.error("Error initializing wallet:", error);
          // Initialize with default addresses on error
          set({
            walletAddresses: generateUSDTAddresses(),
            isInitialized: true,
          });
        }
      },

      saveToStorage: async () => {
        const state = get();
        try {
          await AsyncStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
              walletAddresses: state.walletAddresses,
              depositHistory: state.depositHistory,
              withdrawalHistory: state.withdrawalHistory,
              totalDeposited: state.totalDeposited,
              totalWithdrawn: state.totalWithdrawn,
              usdtBalance: state.usdtBalance,
            })
          );
        } catch (error) {
          console.error("Error saving wallet data:", error);
        }
      },

      depositUSDT: async (amount: number, network: string) => {
        const { depositHistory, totalDeposited, usdtBalance } = get();
        
        const newDeposit: DepositHistory = {
          id: Date.now().toString(),
          amount,
          txHash: "0x" + Math.random().toString(16).substring(2, 66),
          status: "pending",
          timestamp: new Date(),
          network,
        };

        set({
          depositHistory: [newDeposit, ...depositHistory],
          totalDeposited: totalDeposited + amount,
        });

        await (get() as any).saveToStorage();

        // Simulate confirmation after 3 seconds
        setTimeout(async () => {
          const { depositHistory, usdtBalance } = get();
          const updated = depositHistory.map(d =>
            d.id === newDeposit.id ? { ...d, status: "confirmed" as const } : d
          );
          set({ 
            depositHistory: updated,
            usdtBalance: usdtBalance + amount
          });
          
          // Update portfolio balance
          const { updateBalance } = await import("./portfolio-store").then(m => m.usePortfolioStore.getState());
          updateBalance("USDT", usdtBalance + amount, usdtBalance + amount);
          
          await (get() as any).saveToStorage();
        }, 3000);
      },

      withdrawUSDT: async (amount: number, address: string, network: string) => {
        const { withdrawalHistory, totalWithdrawn, usdtBalance } = get();
        
        if (amount > usdtBalance) {
          console.error("Insufficient USDT balance");
          return false;
        }
        
        const fee = amount * 0.001; // 0.1% fee
        const totalAmount = amount + fee;
        
        if (totalAmount > usdtBalance) {
          console.error("Insufficient balance including fees");
          return false;
        }
        
        const newWithdrawal: WithdrawalHistory = {
          id: Date.now().toString(),
          amount,
          address,
          status: "pending",
          timestamp: new Date(),
          network,
          fee,
        };

        set({
          withdrawalHistory: [newWithdrawal, ...withdrawalHistory],
          totalWithdrawn: totalWithdrawn + amount,
          usdtBalance: usdtBalance - totalAmount,
        });

        await (get() as any).saveToStorage();

        // Simulate processing
        setTimeout(async () => {
          const { withdrawalHistory } = get();
          const updated = withdrawalHistory.map(w =>
            w.id === newWithdrawal.id 
              ? { ...w, status: "processing" as const, txHash: "0x" + Math.random().toString(16).substring(2, 66) } 
              : w
          );
          set({ withdrawalHistory: updated });
          await (get() as any).saveToStorage();

          // Complete after another 3 seconds
          setTimeout(async () => {
            const { withdrawalHistory } = get();
            const updated = withdrawalHistory.map(w =>
              w.id === newWithdrawal.id ? { ...w, status: "completed" as const } : w
            );
            set({ withdrawalHistory: updated });
            
            // Update portfolio balance
            const { updateBalance } = await import("./portfolio-store").then(m => m.usePortfolioStore.getState());
            const { usdtBalance } = get();
            updateBalance("USDT", usdtBalance, usdtBalance);
            
            await (get() as any).saveToStorage();
          }, 3000);
        }, 2000);
        
        return true;
      },

      getUSDTAddress: (network: string) => {
        const { walletAddresses } = get();
        return walletAddresses.find(w => w.network === network);
      },

      updateUSDTBalance: async (newBalance: number) => {
        set({ usdtBalance: newBalance });
        
        // Sync with portfolio store
        try {
          const { usePortfolioStore } = await import("./portfolio-store");
          const portfolioStore = usePortfolioStore.getState();
          portfolioStore.updateBalance("USDT", newBalance, newBalance);
          console.log('Synced wallet USDT balance with portfolio:', newBalance);
        } catch (error) {
          console.error('Error syncing wallet balance with portfolio:', error);
        }
        
        await (get() as any).saveToStorage();
      },

      clearHistory: async () => {
        set({
          depositHistory: [],
          withdrawalHistory: [],
          totalDeposited: 0,
          totalWithdrawn: 0,
        });
        await (get() as any).saveToStorage();
      },
    })
  )
);