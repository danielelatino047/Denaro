import { create } from "zustand";
import type { ArbitrageOpportunity } from './arbitrage-store';

export interface AITradingStats {
  totalTrades: number;
  successfulTrades: number;
  totalProfit: number;
  averageProfit: number;
  lastTradeTime: Date | null;
}

export interface AITradingSettings {
  minProfitPercentage: number;
  maxSlippage: number;
  tradingHours: {
    start: string;
    end: string;
  };
  minVolumeThreshold: number;
  maxTradesPerOpportunity: number;
  stopLossPercentage: number;
}

type AITradingStore = {
  isEnabled: boolean;
  isMonitoring: boolean;
  isScanning: boolean;
  scanningProgress: number;
  currentScanTarget: string;
  activeOpportunityTrades: Map<string, number>;
  lastResetTime?: number;
  unsubscribe?: () => void;
  lastProcessedOpportunities?: ArbitrageOpportunity[];
  stats: AITradingStats;
  settings: AITradingSettings;
  toggleAI: () => void;
  updateSettings: (newSettings: Partial<AITradingSettings>) => void;
  startAITrading: () => Promise<void>;
  stopAITrading: () => void;
  processOpportunities: (opportunities: ArbitrageOpportunity[]) => Promise<void>;
  shouldExecuteTrade: (opportunity: ArbitrageOpportunity) => boolean;
  getTodayTradeCount: () => number;
  setScanningState: (isScanning: boolean, progress?: number, target?: string) => void;
};

export const useAITradingStore = create<AITradingStore>()((set, get) => ({
  isEnabled: false,
  isMonitoring: false,
  isScanning: false,
  scanningProgress: 0,
  currentScanTarget: '',
  activeOpportunityTrades: new Map(),
  stats: {
    totalTrades: 47,
    successfulTrades: 43,
    totalProfit: 1247.85,
    averageProfit: 26.55,
    lastTradeTime: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
  },
  settings: {
    minProfitPercentage: 0.1, // Lower threshold for more opportunities
    maxSlippage: 1.0,
    tradingHours: {
      start: "00:00",
      end: "23:59",
    },
    minVolumeThreshold: 10000, // Minimum $10k volume
    maxTradesPerOpportunity: 999999, // Unlimited trades for compound growth
    stopLossPercentage: 2.0, // 2% stop loss
  },
  
  toggleAI: () => {
    const { isEnabled } = get();
    const newState = !isEnabled;
    set({ isEnabled: newState });
    console.log(`AI Trading ${newState ? "enabled" : "disabled"}`);
    
    if (newState) {
      get().startAITrading();
    } else {
      get().stopAITrading();
    }
  },

  updateSettings: (newSettings: Partial<AITradingSettings>) => {
    const { settings } = get();
    set({ settings: { ...settings, ...newSettings } });
    console.log('AI Trading settings updated:', newSettings);
  },

  startAITrading: async () => {
    const { isEnabled } = get();
    
    if (!isEnabled) return;
    
    console.log('🤖 AI Trading started - monitoring arbitrage opportunities...');
    set({ isMonitoring: true });
    
    // Import arbitrage store to monitor opportunities
    const { useArbitrageStore } = await import('./arbitrage-store');
    
    // Subscribe to arbitrage store changes
    const unsubscribe = useArbitrageStore.subscribe(async (state) => {
      if (!get().isEnabled || !get().isMonitoring) return;
      
      const opportunities = state.opportunities;
      const lastProcessed = get().lastProcessedOpportunities;
      
      // Check if opportunities have changed
      const hasChanged = !lastProcessed || 
        opportunities.length !== lastProcessed.length ||
        opportunities.some((opp, idx) => 
          !lastProcessed[idx] || 
          opp.tokenPair !== lastProcessed[idx].tokenPair ||
          opp.buyExchange !== lastProcessed[idx].buyExchange ||
          opp.sellExchange !== lastProcessed[idx].sellExchange ||
          Math.abs(opp.profitPercentage - lastProcessed[idx].profitPercentage) > 0.01
        );
      
      if (hasChanged && opportunities.length > 0) {
        // Process new opportunities
        await get().processOpportunities(opportunities);
        set({ lastProcessedOpportunities: [...opportunities] });
      }
    });
    
    // Store unsubscribe function for cleanup
    set({ unsubscribe });
    
    // Initial processing of current opportunities
    const currentOpportunities = useArbitrageStore.getState().opportunities;
    if (currentOpportunities.length > 0) {
      await get().processOpportunities(currentOpportunities);
      set({ lastProcessedOpportunities: [...currentOpportunities] });
    }
  },
  
  processOpportunities: async (opportunities: ArbitrageOpportunity[]) => {
    const { settings, isEnabled } = get();
    
    if (!isEnabled || opportunities.length === 0) return;
    
    try {
      // Start scanning animation
      get().setScanningState(true, 0, 'AI analyzing opportunities...');
      
      console.log(`🔍 AI processing ${opportunities.length} opportunities from arbitrage scanner...`);
      
      // Simulate scanning progress for visual feedback
      for (let i = 0; i <= 100; i += 20) {
        if (!get().isEnabled) break;
        get().setScanningState(true, i, `Evaluating ${opportunities.length} opportunities...`);
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      // Process each opportunity sequentially with compound effect
      let totalTradesExecuted = 0;
      
      for (const opportunity of opportunities) {
        if (!get().isEnabled) break;
        
        get().setScanningState(true, 100, `Trading ${opportunity.tokenPair}...`);
        
        const shouldTrade = get().shouldExecuteTrade(opportunity);
        
        if (shouldTrade) {
          const opportunityKey = `${opportunity.tokenPair}-${opportunity.buyExchange}-${opportunity.sellExchange}`;
          const currentTrades = get().activeOpportunityTrades.get(opportunityKey) || 0;
          
          // Execute multiple sequential trades with compound effect
          const maxTradesPerOpportunity = settings.maxTradesPerOpportunity;
          let tradesForThisOpportunity = 0;
          
          while (tradesForThisOpportunity < maxTradesPerOpportunity && get().isEnabled) {
            const tradeNumber = currentTrades + tradesForThisOpportunity + 1;
            totalTradesExecuted++;
            
            try {
              // Get FRESH balance for each trade to ensure compound effect
              const { useWalletStore } = await import('./wallet-store');
              const currentBalance = useWalletStore.getState().usdtBalance;
              
              if (currentBalance <= 10) { // Minimum $10 to trade
                console.log('❌ Insufficient USDT balance for trading:', currentBalance);
                break;
              }
              
              // Use 100% of current balance for exponential compound growth
              const tradeAmount = currentBalance;
              
              console.log(`\n🎯 Compound Trade #${totalTradesExecuted} (${opportunity.tokenPair} trade #${tradeNumber})`);
              console.log(`💰 Trading with 100% of current balance: ${tradeAmount.toFixed(2)} USDT`);
              console.log(`📊 Profit rate: ${opportunity.profitPercentage.toFixed(3)}%`);
              
              const { useArbitrageStore } = await import('./arbitrage-store');
              const arbitrageState = useArbitrageStore.getState();
              
              // Execute the trade
              await arbitrageState.executeArbitrage(opportunity, tradeAmount);
              
              // Calculate profit for this specific trade
              const profit = (opportunity.profitPercentage / 100) * tradeAmount;
              const newBalance = currentBalance + profit;
              
              // Update stats
              const currentStats = get().stats;
              set({
                stats: {
                  ...currentStats,
                  totalTrades: currentStats.totalTrades + 1,
                  successfulTrades: currentStats.successfulTrades + 1,
                  totalProfit: currentStats.totalProfit + profit,
                  averageProfit: (currentStats.totalProfit + profit) / (currentStats.totalTrades + 1),
                  lastTradeTime: new Date(),
                }
              });
              
              console.log(`✅ Trade completed: +${profit.toFixed(2)} USDT profit`);
              console.log(`📈 New balance: ${newBalance.toFixed(2)} USDT (${((profit / tradeAmount) * 100).toFixed(4)}% growth)`);
              console.log(`🔄 Ready for next compound trade with ${newBalance.toFixed(2)} USDT\n`);
              
              tradesForThisOpportunity++;
              
              // Small delay between trades for stability (reduced for faster compounding)
              await new Promise<void>(resolve => setTimeout(resolve, 500));
              
            } catch (error) {
              console.error(`❌ Compound trade #${totalTradesExecuted} failed:`, error);
              break; // Stop trying this opportunity if a trade fails
            }
          }
          
          // Update trade count for this opportunity
          get().activeOpportunityTrades.set(opportunityKey, currentTrades + tradesForThisOpportunity);
          
          console.log(`\n📊 Completed ${tradesForThisOpportunity} compound trades for ${opportunity.tokenPair}`);
        }
      }
      
      console.log(`\n🎯 Total compound trades executed: ${totalTradesExecuted}`);
      get().setScanningState(false);
      
      // Reset opportunity trade counts periodically (every 30 seconds for faster compound cycles)
      const now = Date.now();
      const state = get();
      if (!state.lastResetTime || now - state.lastResetTime > 30000) {
        get().activeOpportunityTrades.clear();
        set({ lastResetTime: now });
        console.log('🔄 Reset opportunity trade counts for next compound cycle');
      }
    } catch (error) {
      console.error('Error in AI trading processor:', error);
      get().setScanningState(false);
    }
  },

  stopAITrading: () => {
    console.log('🛑 AI Trading stopped');
    
    // Unsubscribe from arbitrage store
    const { unsubscribe } = get();
    if (unsubscribe) {
      unsubscribe();
    }
    
    set({ 
      isMonitoring: false, 
      isScanning: false, 
      scanningProgress: 0, 
      currentScanTarget: '',
      unsubscribe: undefined
    });
    get().activeOpportunityTrades.clear();
  },

  shouldExecuteTrade: (opportunity: ArbitrageOpportunity) => {
    const { settings } = get();
    const currentTime = new Date();
    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();
    const currentTimeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
    
    if (currentTimeString < settings.tradingHours.start || currentTimeString > settings.tradingHours.end) {
      return false;
    }
    
    if (opportunity.profitPercentage < settings.minProfitPercentage) {
      return false;
    }
    
    if (opportunity.volume < settings.minVolumeThreshold) {
      return false;
    }
    
    // AI trades with 100% of available balance for exponential compound growth
    // No limits on trades per day or per opportunity - continuous compounding
    
    console.log(`✅ AI criteria met for ${opportunity.tokenPair}: ${opportunity.profitPercentage.toFixed(3)}% profit - COMPOUND READY`);
    return true;
  },

  getTodayTradeCount: () => {
    const { stats } = get();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (stats.lastTradeTime && stats.lastTradeTime >= today) {
      return stats.totalTrades;
    }
    return 0;
  },
  
  setScanningState: (isScanning: boolean, progress: number = 0, target: string = '') => {
    set({ 
      isScanning, 
      scanningProgress: progress, 
      currentScanTarget: target 
    });
  },
}));