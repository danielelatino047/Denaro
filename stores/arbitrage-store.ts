import { create } from "zustand";
import { combine } from "zustand/middleware";
import { wsManager, PriceData } from './websocket-manager';

export interface ArbitrageOpportunity {
  tokenPair: string;
  buyExchange: string;
  sellExchange: string;
  buyPrice: number;
  sellPrice: number;
  profitPercentage: number;
  profitAmount: number;
  volume: number;
  lastUpdated: Date;
  minTradeAmount: number;
  maxTradeAmount: number;
}

// REST API fallback functions for the 3 exchanges only
const fetchBinancePrice = async (symbol: string): Promise<{ price: number; volume: number } | null> => {
  try {
    const response = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`);
    
    if (!response.ok) {
      console.error(`Binance API error: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    
    return {
      price: parseFloat(data.lastPrice),
      volume: parseFloat(data.volume)
    };
  } catch (error) {
    console.error('Error fetching Binance price:', error);
    return null;
  }
};

const fetchKucoinPrice = async (symbol: string): Promise<{ price: number; volume: number } | null> => {
  try {
    const response = await fetch(`https://api.kucoin.com/api/v1/market/stats?symbol=${symbol}`);
    
    if (!response.ok) {
      console.error(`KuCoin API error: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    if (!data.data) {
      console.error(`No KuCoin data for ${symbol}`);
      return null;
    }
    
    return {
      price: parseFloat(data.data.last),
      volume: parseFloat(data.data.volValue) || 0
    };
  } catch (error) {
    console.error('Error fetching KuCoin price:', error);
    return null;
  }
};

const fetchBybitPrice = async (symbol: string): Promise<{ price: number; volume: number } | null> => {
  try {
    const response = await fetch(`https://api.bybit.com/v5/market/tickers?category=spot&symbol=${symbol}`);
    
    if (!response.ok) {
      console.error(`Bybit API error: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    if (!data.result?.list?.[0]) {
      console.error(`No Bybit data for ${symbol}`);
      return null;
    }
    
    const ticker = data.result.list[0];
    
    return {
      price: parseFloat(ticker.lastPrice),
      volume: parseFloat(ticker.volume24h) || 0
    };
  } catch (error) {
    console.error('Error fetching Bybit price:', error);
    return null;
  }
};

// Dynamic coin mappings - fetched from exchanges
let DYNAMIC_COIN_MAPPINGS: { [key: string]: { binance?: string; kucoin?: string; bybit?: string } } = {};
let LAST_COIN_FETCH = 0;
const COIN_FETCH_INTERVAL = 300000; // 5 minutes

// Fetch all available USDT pairs from each exchange
const fetchAllUSDTPairs = async (): Promise<void> => {
  const now = Date.now();
  if (now - LAST_COIN_FETCH < COIN_FETCH_INTERVAL && Object.keys(DYNAMIC_COIN_MAPPINGS).length > 0) {
    return; // Use cached data
  }

  console.log('🔍 Fetching all available USDT pairs from exchanges...');
  
  try {
    // Fetch from all exchanges simultaneously
    const [binancePairs, kucoinPairs, bybitPairs] = await Promise.allSettled([
      fetchBinancePairs(),
      fetchKucoinPairs(), 
      fetchBybitPairs()
    ]);

    const newMappings: { [key: string]: { binance?: string; kucoin?: string; bybit?: string } } = {};

    // Process Binance pairs
    if (binancePairs.status === 'fulfilled') {
      binancePairs.value.forEach(symbol => {
        const pair = symbol.replace('USDT', '/USDT');
        if (!newMappings[pair]) newMappings[pair] = {};
        newMappings[pair].binance = symbol;
      });
    }

    // Process KuCoin pairs
    if (kucoinPairs.status === 'fulfilled') {
      kucoinPairs.value.forEach(symbol => {
        const pair = symbol.replace('-USDT', '/USDT');
        if (!newMappings[pair]) newMappings[pair] = {};
        newMappings[pair].kucoin = symbol;
      });
    }

    // Process Bybit pairs
    if (bybitPairs.status === 'fulfilled') {
      bybitPairs.value.forEach(symbol => {
        const pair = symbol.replace('USDT', '/USDT');
        if (!newMappings[pair]) newMappings[pair] = {};
        newMappings[pair].bybit = symbol;
      });
    }

    // Only keep pairs that exist on at least 2 exchanges (for arbitrage)
    const filteredMappings: { [key: string]: { binance?: string; kucoin?: string; bybit?: string } } = {};
    Object.entries(newMappings).forEach(([pair, mapping]) => {
      const exchangeCount = Object.keys(mapping).length;
      if (exchangeCount >= 2) {
        filteredMappings[pair] = mapping;
      }
    });

    DYNAMIC_COIN_MAPPINGS = filteredMappings;
    LAST_COIN_FETCH = now;
    
    console.log(`✅ Found ${Object.keys(DYNAMIC_COIN_MAPPINGS).length} tradeable USDT pairs across exchanges`);
    console.log('Sample pairs:', Object.keys(DYNAMIC_COIN_MAPPINGS).slice(0, 10));
  } catch (error) {
    console.error('Error fetching coin pairs:', error);
    // Fallback to basic pairs if dynamic fetch fails
    if (Object.keys(DYNAMIC_COIN_MAPPINGS).length === 0) {
      DYNAMIC_COIN_MAPPINGS = {
        'BTC/USDT': { binance: 'BTCUSDT', kucoin: 'BTC-USDT', bybit: 'BTCUSDT' },
        'ETH/USDT': { binance: 'ETHUSDT', kucoin: 'ETH-USDT', bybit: 'ETHUSDT' },
        'BNB/USDT': { binance: 'BNBUSDT', kucoin: 'BNB-USDT', bybit: 'BNBUSDT' },
        'SOL/USDT': { binance: 'SOLUSDT', kucoin: 'SOL-USDT', bybit: 'SOLUSDT' },
        'ADA/USDT': { binance: 'ADAUSDT', kucoin: 'ADA-USDT', bybit: 'ADAUSDT' }
      };
    }
  }
};

// Fetch Binance USDT pairs
const fetchBinancePairs = async (): Promise<string[]> => {
  const response = await fetch('https://api.binance.com/api/v3/exchangeInfo');
  if (!response.ok) throw new Error('Binance API error');
  
  const data = await response.json();
  return data.symbols
    .filter((s: any) => s.status === 'TRADING' && s.quoteAsset === 'USDT' && s.baseAsset !== 'USDT')
    .map((s: any) => s.symbol)
    .slice(0, 200); // Limit to top 200 for performance
};

// Fetch KuCoin USDT pairs
const fetchKucoinPairs = async (): Promise<string[]> => {
  const response = await fetch('https://api.kucoin.com/api/v1/symbols');
  if (!response.ok) throw new Error('KuCoin API error');
  
  const data = await response.json();
  return data.data
    .filter((s: any) => s.enableTrading && s.quoteCurrency === 'USDT' && s.baseCurrency !== 'USDT')
    .map((s: any) => s.symbol)
    .slice(0, 200); // Limit to top 200 for performance
};

// Fetch Bybit USDT pairs
const fetchBybitPairs = async (): Promise<string[]> => {
  const response = await fetch('https://api.bybit.com/v5/market/instruments-info?category=spot');
  if (!response.ok) throw new Error('Bybit API error');
  
  const data = await response.json();
  return data.result.list
    .filter((s: any) => s.status === 'Trading' && s.quoteCoin === 'USDT' && s.baseCoin !== 'USDT')
    .map((s: any) => s.symbol)
    .slice(0, 200); // Limit to top 200 for performance
};

// Calculate fees for the 3 exchanges
const calculateTradingFees = (tradeAmount: number, buyExchange: string, sellExchange: string): number => {
  const exchangeFees: { [key: string]: number } = {
    'Binance': 0.001,     // 0.1%
    'KuCoin': 0.001,      // 0.1%
    'Bybit': 0.001,       // 0.1%
  };
  
  const buyFee = (exchangeFees[buyExchange] || 0.001) * tradeAmount;
  const sellFee = (exchangeFees[sellExchange] || 0.001) * tradeAmount;
  
  return buyFee + sellFee;
};

// Calculate net profit after fees
const calculateNetProfit = (grossProfit: number, tradeAmount: number, buyExchange: string, sellExchange: string): number => {
  const fees = calculateTradingFees(tradeAmount, buyExchange, sellExchange);
  return grossProfit - fees;
};

export const useArbitrageStore = create(
  combine(
    {
      opportunities: [] as ArbitrageOpportunity[],
      isLoading: false,
      totalProfit: 0,
      isLiveMode: false,
      updateInterval: null as ReturnType<typeof setInterval> | null,
      lastUpdateTime: null as Date | null,
      priceData: new Map<string, Map<string, PriceData>>(), // symbol -> exchange -> price data
      wsConnected: false,
    },
    (set, get) => ({
      startLiveUpdates: async () => {
        const state = get();
        
        // Clear existing interval if any
        if (state.updateInterval) {
          clearInterval(state.updateInterval);
        }
        
        console.log('🔴 Starting live arbitrage data updates with WebSocket...');
        
        // Connect to WebSocket feeds
        await wsManager.connect();
        
        // Subscribe to price updates
        const unsubscribe = wsManager.onPriceUpdate((data: PriceData) => {
          const { priceData } = get();
          
          // Update price data map
          if (!priceData.has(data.symbol)) {
            priceData.set(data.symbol, new Map());
          }
          priceData.get(data.symbol)?.set(data.exchange, data);
          
          // Recalculate opportunities with new price
          useArbitrageStore.getState().calculateOpportunities();
        });
        
        set({ 
          isLiveMode: true,
          wsConnected: true
        });
        
        // Fallback: Also fetch via REST API every 30 seconds
        const interval = setInterval(() => {
          console.log('🔄 Fallback REST API fetch...');
          useArbitrageStore.getState().fetchOpportunitiesREST();
        }, 30000);
        
        set({ updateInterval: interval });
        
        // Initial REST fetch to populate data immediately
        await useArbitrageStore.getState().fetchOpportunitiesREST();
      },
      
      stopLiveUpdates: () => {
        const state = get();
        
        if (state.updateInterval) {
          clearInterval(state.updateInterval);
          console.log('⏹️ Stopped live arbitrage updates');
        }
        
        // Disconnect WebSocket
        wsManager.disconnect();
        
        set({ 
          isLiveMode: false,
          updateInterval: null,
          wsConnected: false
        });
      },
      
      calculateOpportunities: () => {
        const { priceData } = get();
        const opportunities: ArbitrageOpportunity[] = [];
        
        // Calculate arbitrage opportunities from current price data
        priceData.forEach((exchangePrices, symbol) => {
          const prices = Array.from(exchangePrices.values());
          
          if (prices.length >= 2) {
            // Find all possible arbitrage combinations
            for (let i = 0; i < prices.length - 1; i++) {
              for (let j = i + 1; j < prices.length; j++) {
                const price1 = prices[i];
                const price2 = prices[j];
                
                // Determine buy and sell exchanges (always buy low, sell high)
                let buyExchange, sellExchange, buyPrice, sellPrice, volume;
                
                if (price1.price < price2.price) {
                  buyExchange = price1.exchange;
                  sellExchange = price2.exchange;
                  buyPrice = price1.price;
                  sellPrice = price2.price;
                  volume = (price1.volume + price2.volume) / 2;
                } else if (price2.price < price1.price) {
                  buyExchange = price2.exchange;
                  sellExchange = price1.exchange;
                  buyPrice = price2.price;
                  sellPrice = price1.price;
                  volume = (price1.volume + price2.volume) / 2;
                } else {
                  continue; // No price difference
                }
                
                const grossProfitPercentage = ((sellPrice - buyPrice) / buyPrice) * 100;
                const grossProfitAmount = sellPrice - buyPrice;
                
                // Calculate net profit after fees for a standard $1000 trade
                const standardTradeAmount = 1000;
                const grossProfit = (grossProfitPercentage / 100) * standardTradeAmount;
                const netProfit = calculateNetProfit(grossProfit, standardTradeAmount, buyExchange, sellExchange);
                const netProfitPercentage = (netProfit / standardTradeAmount) * 100;
                
                // Only show opportunities that are profitable AFTER fees
                if (netProfitPercentage > 0.05) { // At least 0.05% net profit
                  opportunities.push({
                    tokenPair: symbol,
                    buyExchange,
                    sellExchange,
                    buyPrice,
                    sellPrice,
                    profitPercentage: netProfitPercentage,
                    profitAmount: grossProfitAmount,
                    volume,
                    minTradeAmount: 10,
                    maxTradeAmount: Math.min(10000, volume * 0.001),
                    lastUpdated: new Date(),
                  });
                }
              }
            }
          }
        });
        
        // Sort by net profit percentage (highest first)
        const sortedOpportunities = opportunities.sort((a, b) => b.profitPercentage - a.profitPercentage);
        const totalProfit = sortedOpportunities.reduce((sum, opp) => sum + opp.profitAmount, 0);
        
        set({ 
          opportunities: sortedOpportunities,
          totalProfit,
          lastUpdateTime: new Date()
        });
      },
      
      fetchOpportunitiesREST: async () => {
        const { isLiveMode } = get();
        
        // Check if we're in live mode from settings
        const { settings } = await import('./settings-store').then(m => m.useSettingsStore.getState());
        const isActuallyLiveMode = settings.isLiveMode;
        
        // Don't show loading for live updates to avoid UI flickering
        if (!isLiveMode) {
          set({ isLoading: true });
        }
        
        try {
          let opportunities: ArbitrageOpportunity[] = [];
          
          // BOTH LIVE AND DEMO MODE: Fetch real arbitrage opportunities from ALL available exchanges
          console.log(`${isActuallyLiveMode ? '🔴 LIVE MODE' : '🟡 DEMO MODE'}: Fetching ALL available USDT pairs from exchanges...`);
          
          // Ensure we have the latest coin mappings
          await fetchAllUSDTPairs();
          
          const pairs = Object.keys(DYNAMIC_COIN_MAPPINGS);
          console.log(`🔍 Scanning ${pairs.length} coin pairs across all 3 exchanges simultaneously...`);
          
          for (const pair of pairs) {
            try {
              const mapping = DYNAMIC_COIN_MAPPINGS[pair];
              if (!mapping) continue;
              
              // Fetch from all available exchanges for this pair with timeout
              const fetchPromises: Promise<{ price: number; volume: number } | null>[] = [];
              
              if (mapping.binance) {
                fetchPromises.push(
                  Promise.race([
                    fetchBinancePrice(mapping.binance),
                    new Promise<null>((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000))
                  ]).catch(() => null)
                );
              }
              
              if (mapping.kucoin) {
                fetchPromises.push(
                  Promise.race([
                    fetchKucoinPrice(mapping.kucoin),
                    new Promise<null>((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000))
                  ]).catch(() => null)
                );
              }
              
              if (mapping.bybit) {
                fetchPromises.push(
                  Promise.race([
                    fetchBybitPrice(mapping.bybit),
                    new Promise<null>((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000))
                  ]).catch(() => null)
                );
              }
              
              const results = await Promise.all(fetchPromises);
              
              const priceData: { exchange: string; price: number; volume: number }[] = [];
              let resultIndex = 0;
              
              if (mapping.binance && results[resultIndex]) {
                const data = results[resultIndex];
                if (data) priceData.push({ exchange: 'Binance', price: data.price, volume: data.volume });
                resultIndex++;
              }
              
              if (mapping.kucoin && results[resultIndex]) {
                const data = results[resultIndex];
                if (data) priceData.push({ exchange: 'KuCoin', price: data.price, volume: data.volume });
                resultIndex++;
              }
              
              if (mapping.bybit && results[resultIndex]) {
                const data = results[resultIndex];
                if (data) priceData.push({ exchange: 'Bybit', price: data.price, volume: data.volume });
                resultIndex++;
              }
              
              if (priceData.length >= 2) {
                // Find all possible arbitrage combinations
                for (let i = 0; i < priceData.length - 1; i++) {
                  for (let j = i + 1; j < priceData.length; j++) {
                    const price1 = priceData[i];
                    const price2 = priceData[j];
                    
                    // Determine buy and sell exchanges
                    let buyExchange, sellExchange, buyPrice, sellPrice;
                    
                    if (price1.price < price2.price) {
                      buyExchange = price1.exchange;
                      sellExchange = price2.exchange;
                      buyPrice = price1.price;
                      sellPrice = price2.price;
                    } else if (price2.price < price1.price) {
                      buyExchange = price2.exchange;
                      sellExchange = price1.exchange;
                      buyPrice = price2.price;
                      sellPrice = price1.price;
                    } else {
                      continue;
                    }
                    
                    const grossProfitPercentage = ((sellPrice - buyPrice) / buyPrice) * 100;
                    const grossProfitAmount = sellPrice - buyPrice;
                    
                    // Calculate net profit after fees
                    const standardTradeAmount = 1000;
                    const grossProfit = (grossProfitPercentage / 100) * standardTradeAmount;
                    const netProfit = calculateNetProfit(grossProfit, standardTradeAmount, buyExchange, sellExchange);
                    const netProfitPercentage = (netProfit / standardTradeAmount) * 100;
                    
                    // Only show profitable opportunities after fees
                    if (netProfitPercentage > 0.05) {
                      const avgVolume = (price1.volume + price2.volume) / 2;
                      
                      opportunities.push({
                        tokenPair: pair,
                        buyExchange,
                        sellExchange,
                        buyPrice,
                        sellPrice,
                        profitPercentage: netProfitPercentage,
                        profitAmount: grossProfitAmount,
                        volume: avgVolume,
                        minTradeAmount: 10,
                        maxTradeAmount: Math.min(10000, avgVolume * 0.001),
                        lastUpdated: new Date(),
                      });
                    }
                  }
                }
              }
            } catch (error) {
              console.error(`Error processing ${pair}:`, error);
            }
          }
          
          // Sort by net profit percentage (highest first)
          const sortedOpportunities = opportunities.sort((a, b) => b.profitPercentage - a.profitPercentage);
          const totalProfit = sortedOpportunities.reduce((sum, opp) => sum + opp.profitAmount, 0);
          
          set({ 
            opportunities: sortedOpportunities,
            totalProfit,
            isLoading: false,
            lastUpdateTime: new Date()
          });
          
          console.log(`✅ Found ${sortedOpportunities.length} real arbitrage opportunities (${isActuallyLiveMode ? 'LIVE execution' : 'DEMO simulation'})`);
        } catch (error) {
          console.error('Error fetching opportunities:', error);
          set({ isLoading: false });
        }
      },
      
      fetchOpportunities: async () => {
        // Alias for REST fetch
        await useArbitrageStore.getState().fetchOpportunitiesREST();
      },
      
      refreshOpportunities: async () => {
        // Manual refresh - always show loading
        set({ isLoading: true });
        await useArbitrageStore.getState().fetchOpportunitiesREST();
      },

      generateDemoOpportunities: async (): Promise<ArbitrageOpportunity[]> => {
        console.log('🎭 Generating demo arbitrage opportunities...');
        
        const demoOpportunities: ArbitrageOpportunity[] = [];
        const exchanges = ['Binance', 'KuCoin', 'Bybit'];
        
        // Ensure we have coin mappings for demo
        if (Object.keys(DYNAMIC_COIN_MAPPINGS).length === 0) {
          await fetchAllUSDTPairs();
        }
        
        const pairs = Object.keys(DYNAMIC_COIN_MAPPINGS).slice(0, 50); // Use first 50 pairs for demo
        
        pairs.forEach(pair => {
          // Generate 1-3 opportunities per pair
          const numOpportunities = Math.floor(Math.random() * 3) + 1;
          
          for (let i = 0; i < numOpportunities; i++) {
            // Random base price (realistic crypto prices)
            const basePrice = pair.includes('BTC') ? 45000 + Math.random() * 10000 :
                             pair.includes('ETH') ? 2500 + Math.random() * 1000 :
                             pair.includes('BNB') ? 300 + Math.random() * 100 :
                             pair.includes('SOL') ? 80 + Math.random() * 40 :
                             1 + Math.random() * 10;
            
            // Random exchanges for buy/sell
            const buyExchange = exchanges[Math.floor(Math.random() * exchanges.length)];
            let sellExchange = exchanges[Math.floor(Math.random() * exchanges.length)];
            while (sellExchange === buyExchange) {
              sellExchange = exchanges[Math.floor(Math.random() * exchanges.length)];
            }
            
            // Generate profitable price difference (0.1% to 2%)
            const profitMargin = 0.001 + Math.random() * 0.019; // 0.1% to 2%
            const buyPrice = basePrice;
            const sellPrice = buyPrice * (1 + profitMargin);
            
            // Calculate net profit after fees
            const standardTradeAmount = 1000;
            const grossProfit = (profitMargin) * standardTradeAmount;
            const netProfit = calculateNetProfit(grossProfit, standardTradeAmount, buyExchange, sellExchange);
            const netProfitPercentage = (netProfit / standardTradeAmount) * 100;
            
            // Only add if profitable after fees
            if (netProfitPercentage > 0.05) {
              const volume = 50000 + Math.random() * 200000; // Random volume
              
              demoOpportunities.push({
                tokenPair: pair,
                buyExchange,
                sellExchange,
                buyPrice,
                sellPrice,
                profitPercentage: netProfitPercentage,
                profitAmount: sellPrice - buyPrice,
                volume,
                minTradeAmount: 10,
                maxTradeAmount: Math.min(5000, volume * 0.001),
                lastUpdated: new Date(),
              });
            }
          }
        });
        
        // Sort by profit percentage and return top 20
        return demoOpportunities
          .sort((a, b) => b.profitPercentage - a.profitPercentage)
          .slice(0, 20);
      },

      executeArbitrage: async (opportunity: ArbitrageOpportunity, tradeAmount: number = 100) => {
        console.log("Executing arbitrage:", opportunity, "Amount:", tradeAmount);
        
        // Import portfolio store functions
        const portfolioStore = await import('./portfolio-store').then(m => m.usePortfolioStore.getState());
        const { settings } = await import('./settings-store').then(m => m.useSettingsStore.getState());
        
        if (settings.isLiveMode) {
          // In live mode, check if WalletConnect is enabled
          if (settings.walletConnect.enabled && settings.walletConnect.connectedAddress) {
            console.log('LIVE MODE: Would execute real trades via WalletConnect');
            // Here you would integrate with WalletConnect to execute the trade
          } else if (settings.apiKeys.configured) {
            console.log('LIVE MODE: Would execute real trades via Exchange APIs');
            // Here you would use exchange APIs to execute trades
          } else {
            console.log('LIVE MODE: No execution method configured');
          }
          return;
        }
        
        // Demo mode execution
        const currentUSDT = portfolioStore.balances.find(b => b.symbol === 'USDT')?.amount || 0;
        
        // Check if we have enough USDT for the trade
        if (currentUSDT < tradeAmount) {
          console.log(`Insufficient USDT balance: ${currentUSDT} < ${tradeAmount}`);
          return;
        }
        
        // Calculate profit with fees
        const grossProfit = (opportunity.profitPercentage / 100) * tradeAmount;
        const fees = calculateTradingFees(tradeAmount, opportunity.buyExchange, opportunity.sellExchange);
        const netProfit = grossProfit;  // profitPercentage is already net
        
        console.log(`Trade calculation: Amount: ${tradeAmount}, Net profit: ${netProfit.toFixed(2)}`);
        
        // Only execute if profitable after fees
        if (netProfit <= 0) {
          console.log(`Trade would not be profitable: ${netProfit.toFixed(2)}`);
          return;
        }
        
        // Simulate trade execution - add transaction with detailed arbitrage info
        portfolioStore.addTransaction({
          type: 'arbitrage',
          tokenPair: opportunity.tokenPair,
          amount: tradeAmount / opportunity.buyPrice,
          price: opportunity.buyPrice,
          usdtAmount: tradeAmount, // Amount in USDT that was traded
          profit: netProfit,
          timestamp: new Date(),
          status: 'completed',
          exchange: `${opportunity.buyExchange} → ${opportunity.sellExchange}`,
          // Additional arbitrage details
          buyExchange: opportunity.buyExchange,
          sellExchange: opportunity.sellExchange,
          buyPrice: opportunity.buyPrice,
          sellPrice: opportunity.sellPrice,
          profitPercentage: opportunity.profitPercentage
        });
        
        // Update USDT balance with net profit
        const newUSDTBalance = currentUSDT + netProfit;
        portfolioStore.updateBalance('USDT', newUSDTBalance, newUSDTBalance);
        
        // CRITICAL: Update wallet balance to sync with portfolio for compound effect
        try {
          const { useWalletStore } = await import('./wallet-store');
          const walletStore = useWalletStore.getState();
          await walletStore.updateUSDTBalance(newUSDTBalance);
          console.log(`🔄 Wallet balance synced for compound effect: ${newUSDTBalance.toFixed(2)} USDT`);
        } catch (error) {
          console.error('Error syncing wallet balance after trade:', error);
        }
        
        console.log(`✅ Demo arbitrage executed successfully!`);
        console.log(`Net profit: +${netProfit.toFixed(2)} USDT`);
        console.log(`📈 New total balance: ${newUSDTBalance.toFixed(2)} USDT (ready for next compound trade)`);
      },
    })
  )
);