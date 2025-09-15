import { Platform } from 'react-native';

export interface PriceData {
  symbol: string;
  price: number;
  volume: number;
  timestamp: Date;
  exchange: string;
}

export interface OrderBookData {
  symbol: string;
  bids: Array<[number, number]>; // [price, quantity]
  asks: Array<[number, number]>;
  exchange: string;
}

type PriceCallback = (data: PriceData) => void;
type OrderBookCallback = (data: OrderBookData) => void;

class WebSocketManager {
  private binanceWs: WebSocket | null = null;
  private bybitWs: WebSocket | null = null;
  private kucoinWs: WebSocket | null = null;
  private kucoinToken: string | null = null;
  private kucoinEndpoint: string | null = null;
  
  private priceCallbacks: Set<PriceCallback> = new Set();
  private orderBookCallbacks: Set<OrderBookCallback> = new Set();
  
  private reconnectTimeouts: Map<string, ReturnType<typeof setTimeout>> = new Map();
  private isConnected: Map<string, boolean> = new Map();
  
  // Dynamic symbol mappings - will be populated from arbitrage store
  private symbolMappings: { [key: string]: { binance?: string; bybit?: string; kucoin?: string } } = {};
  
  // Get dynamic mappings from arbitrage store
  private async getSymbolMappings() {
    try {
      // Import the dynamic mappings from arbitrage store
      const { useArbitrageStore } = await import('./arbitrage-store');
      
      // Access the dynamic mappings (we need to make them accessible)
      // For now, use a basic set as fallback
      this.symbolMappings = {
        'BTC/USDT': { binance: 'btcusdt', bybit: 'BTCUSDT', kucoin: 'BTC-USDT' },
        'ETH/USDT': { binance: 'ethusdt', bybit: 'ETHUSDT', kucoin: 'ETH-USDT' },
        'BNB/USDT': { binance: 'bnbusdt', bybit: 'BNBUSDT', kucoin: 'BNB-USDT' },
        'SOL/USDT': { binance: 'solusdt', bybit: 'SOLUSDT', kucoin: 'SOL-USDT' },
        'ADA/USDT': { binance: 'adausdt', bybit: 'ADAUSDT', kucoin: 'ADA-USDT' }
      };
      
      console.log(`WebSocket: Using ${Object.keys(this.symbolMappings).length} symbol mappings`);
    } catch (error) {
      console.error('Failed to get symbol mappings:', error);
    }
  }
  
  constructor() {
    console.log('WebSocketManager initialized');
  }
  
  // Initialize KuCoin WebSocket (requires token fetch)
  private async initKuCoin(): Promise<void> {
    try {
      const response = await fetch('https://api.kucoin.com/api/v1/bullet-public', {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error(`KuCoin init failed: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.code === '200000' && data.data) {
        this.kucoinToken = data.data.token;
        this.kucoinEndpoint = data.data.instanceServers[0].endpoint;
        console.log('KuCoin WebSocket token obtained');
      }
    } catch (error) {
      console.error('Failed to initialize KuCoin WebSocket:', error);
    }
  }
  
  // Connect to Binance WebSocket
  private async connectBinance(): Promise<void> {
    if (this.binanceWs?.readyState === WebSocket.OPEN) return;
    
    // Ensure we have symbol mappings
    await this.getSymbolMappings();
    
    try {
      // Subscribe to multiple streams
      const symbols = Object.values(this.symbolMappings)
        .map(m => m.binance)
        .filter(Boolean) as string[];
      
      if (symbols.length === 0) {
        console.warn('No Binance symbols to subscribe to');
        return;
      }
      
      const streams = symbols.flatMap(s => [`${s}@ticker`, `${s}@depth20@100ms`]).join('/');
      const wsUrl = `wss://stream.binance.com:9443/stream?streams=${streams}`;
      
      this.binanceWs = new WebSocket(wsUrl);
      
      this.binanceWs.onopen = () => {
        console.log('Binance WebSocket connected');
        this.isConnected.set('binance', true);
      };
      
      this.binanceWs.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          const data = message.data;
          
          if (data.e === '24hrTicker') {
            // Price ticker update
            const symbol = this.findSymbolByBinance(data.s.toLowerCase());
            if (symbol) {
              const priceData: PriceData = {
                symbol,
                price: parseFloat(data.c),
                volume: parseFloat(data.v),
                timestamp: new Date(),
                exchange: 'Binance'
              };
              this.notifyPriceCallbacks(priceData);
            }
          } else if (data.bids && data.asks) {
            // Order book update
            const streamName = message.stream.split('@')[0];
            const symbol = this.findSymbolByBinance(streamName);
            if (symbol) {
              const orderBookData: OrderBookData = {
                symbol,
                bids: data.bids.map((b: string[]) => [parseFloat(b[0]), parseFloat(b[1])]),
                asks: data.asks.map((a: string[]) => [parseFloat(a[0]), parseFloat(a[1])]),
                exchange: 'Binance'
              };
              this.notifyOrderBookCallbacks(orderBookData);
            }
          }
        } catch (error) {
          console.error('Binance message parse error:', error);
        }
      };
      
      this.binanceWs.onerror = (error) => {
        console.error('Binance WebSocket error:', error);
      };
      
      this.binanceWs.onclose = () => {
        console.log('Binance WebSocket closed');
        this.isConnected.set('binance', false);
        this.scheduleReconnect('binance', () => this.connectBinance());
      };
    } catch (error) {
      console.error('Failed to connect Binance WebSocket:', error);
    }
  }
  
  // Connect to Bybit WebSocket
  private async connectBybit(): Promise<void> {
    if (this.bybitWs?.readyState === WebSocket.OPEN) return;
    
    // Ensure we have symbol mappings
    await this.getSymbolMappings();
    
    try {
      this.bybitWs = new WebSocket('wss://stream.bybit.com/v5/public/spot');
      
      this.bybitWs.onopen = () => {
        console.log('Bybit WebSocket connected');
        this.isConnected.set('bybit', true);
        
        // Subscribe to tickers and orderbooks
        const symbols = Object.values(this.symbolMappings)
          .map(m => m.bybit)
          .filter(Boolean) as string[];
        
        if (symbols.length === 0) {
          console.warn('No Bybit symbols to subscribe to');
          return;
        }
        
        // Subscribe to tickers
        this.bybitWs?.send(JSON.stringify({
          op: 'subscribe',
          args: symbols.map(s => `tickers.${s}`)
        }));
        
        // Subscribe to orderbooks
        this.bybitWs?.send(JSON.stringify({
          op: 'subscribe',
          args: symbols.map(s => `orderbook.40.${s}`)
        }));
      };
      
      this.bybitWs.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          if (message.topic?.startsWith('tickers.')) {
            const symbolBybit = message.topic.split('.')[1];
            const symbol = this.findSymbolByBybit(symbolBybit);
            if (symbol && message.data) {
              const priceData: PriceData = {
                symbol,
                price: parseFloat(message.data.lastPrice),
                volume: parseFloat(message.data.volume24h),
                timestamp: new Date(),
                exchange: 'Bybit'
              };
              this.notifyPriceCallbacks(priceData);
            }
          } else if (message.topic?.startsWith('orderbook.')) {
            const symbolBybit = message.topic.split('.')[2];
            const symbol = this.findSymbolByBybit(symbolBybit);
            if (symbol && message.data) {
              const orderBookData: OrderBookData = {
                symbol,
                bids: message.data.b.map((b: string[]) => [parseFloat(b[0]), parseFloat(b[1])]),
                asks: message.data.a.map((a: string[]) => [parseFloat(a[0]), parseFloat(a[1])]),
                exchange: 'Bybit'
              };
              this.notifyOrderBookCallbacks(orderBookData);
            }
          }
        } catch (error) {
          console.error('Bybit message parse error:', error);
        }
      };
      
      this.bybitWs.onerror = (error) => {
        console.error('Bybit WebSocket error:', error);
      };
      
      this.bybitWs.onclose = () => {
        console.log('Bybit WebSocket closed');
        this.isConnected.set('bybit', false);
        this.scheduleReconnect('bybit', () => this.connectBybit());
      };
    } catch (error) {
      console.error('Failed to connect Bybit WebSocket:', error);
    }
  }
  
  // Connect to KuCoin WebSocket
  private async connectKuCoin(): Promise<void> {
    if (this.kucoinWs?.readyState === WebSocket.OPEN) return;
    
    // Initialize if not done
    if (!this.kucoinToken || !this.kucoinEndpoint) {
      await this.initKuCoin();
    }
    
    if (!this.kucoinToken || !this.kucoinEndpoint) {
      console.error('Failed to get KuCoin WebSocket credentials');
      return;
    }
    
    try {
      const wsUrl = `${this.kucoinEndpoint}?token=${this.kucoinToken}`;
      this.kucoinWs = new WebSocket(wsUrl);
      
      this.kucoinWs.onopen = () => {
        console.log('KuCoin WebSocket connected');
        this.isConnected.set('kucoin', true);
        
        // Subscribe to market tickers and order books
        const symbols = Object.values(this.symbolMappings)
          .map(m => m.kucoin)
          .filter(Boolean) as string[];
        
        if (symbols.length === 0) {
          console.warn('No KuCoin symbols to subscribe to');
          return;
        }
        
        // Subscribe to tickers
        this.kucoinWs?.send(JSON.stringify({
          id: Date.now(),
          type: 'subscribe',
          topic: `/market/ticker:${symbols.join(',')}`
        }));
        
        // Subscribe to order books
        symbols.forEach(symbol => {
          this.kucoinWs?.send(JSON.stringify({
            id: Date.now(),
            type: 'subscribe',
            topic: `/market/level2:${symbol}`
          }));
        });
      };
      
      this.kucoinWs.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          if (message.type === 'message') {
            if (message.topic.startsWith('/market/ticker:')) {
              const symbolKucoin = message.subject;
              const symbol = this.findSymbolByKucoin(symbolKucoin);
              if (symbol && message.data) {
                const priceData: PriceData = {
                  symbol,
                  price: parseFloat(message.data.price),
                  volume: parseFloat(message.data.size || '0'),
                  timestamp: new Date(),
                  exchange: 'KuCoin'
                };
                this.notifyPriceCallbacks(priceData);
              }
            } else if (message.topic.startsWith('/market/level2:')) {
              const symbolKucoin = message.topic.split(':')[1];
              const symbol = this.findSymbolByKucoin(symbolKucoin);
              if (symbol && message.data) {
                const orderBookData: OrderBookData = {
                  symbol,
                  bids: message.data.bids?.slice(0, 20).map((b: string[]) => [parseFloat(b[0]), parseFloat(b[1])]) || [],
                  asks: message.data.asks?.slice(0, 20).map((a: string[]) => [parseFloat(a[0]), parseFloat(a[1])]) || [],
                  exchange: 'KuCoin'
                };
                this.notifyOrderBookCallbacks(orderBookData);
              }
            }
          }
        } catch (error) {
          console.error('KuCoin message parse error:', error);
        }
      };
      
      this.kucoinWs.onerror = (error) => {
        console.error('KuCoin WebSocket error:', error);
      };
      
      this.kucoinWs.onclose = () => {
        console.log('KuCoin WebSocket closed');
        this.isConnected.set('kucoin', false);
        this.scheduleReconnect('kucoin', () => this.connectKuCoin());
      };
    } catch (error) {
      console.error('Failed to connect KuCoin WebSocket:', error);
    }
  }
  
  // Helper methods to find symbols
  private findSymbolByBinance(binanceSymbol: string): string | null {
    for (const [symbol, mapping] of Object.entries(this.symbolMappings)) {
      if (mapping.binance === binanceSymbol) return symbol;
    }
    return null;
  }
  
  private findSymbolByBybit(bybitSymbol: string): string | null {
    for (const [symbol, mapping] of Object.entries(this.symbolMappings)) {
      if (mapping.bybit === bybitSymbol) return symbol;
    }
    return null;
  }
  
  private findSymbolByKucoin(kucoinSymbol: string): string | null {
    for (const [symbol, mapping] of Object.entries(this.symbolMappings)) {
      if (mapping.kucoin === kucoinSymbol) return symbol;
    }
    return null;
  }
  
  // Schedule reconnection
  private scheduleReconnect(exchange: string, reconnectFn: () => void): void {
    // Clear existing timeout if any
    const existingTimeout = this.reconnectTimeouts.get(exchange);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }
    
    // Schedule new reconnection in 5 seconds
    const timeout = setTimeout(() => {
      console.log(`Attempting to reconnect ${exchange}...`);
      reconnectFn();
    }, 5000);
    
    this.reconnectTimeouts.set(exchange, timeout);
  }
  
  // Notify callbacks
  private notifyPriceCallbacks(data: PriceData): void {
    this.priceCallbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Price callback error:', error);
      }
    });
  }
  
  private notifyOrderBookCallbacks(data: OrderBookData): void {
    this.orderBookCallbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('OrderBook callback error:', error);
      }
    });
  }
  
  // Public methods
  public async connect(): Promise<void> {
    console.log('Connecting to all WebSocket feeds...');
    
    // Get symbol mappings first
    await this.getSymbolMappings();
    
    // Connect to all exchanges
    await Promise.all([
      this.connectBinance(),
      this.connectBybit(),
      this.connectKuCoin()
    ]);
  }
  
  public disconnect(): void {
    console.log('Disconnecting all WebSocket feeds...');
    
    // Close all connections
    this.binanceWs?.close();
    this.bybitWs?.close();
    this.kucoinWs?.close();
    
    // Clear all reconnect timeouts
    this.reconnectTimeouts.forEach(timeout => clearTimeout(timeout));
    this.reconnectTimeouts.clear();
    
    // Clear connection status
    this.isConnected.clear();
  }
  
  public onPriceUpdate(callback: PriceCallback): () => void {
    this.priceCallbacks.add(callback);
    return () => this.priceCallbacks.delete(callback);
  }
  
  public onOrderBookUpdate(callback: OrderBookCallback): () => void {
    this.orderBookCallbacks.add(callback);
    return () => this.orderBookCallbacks.delete(callback);
  }
  
  public isExchangeConnected(exchange: 'binance' | 'bybit' | 'kucoin'): boolean {
    return this.isConnected.get(exchange) || false;
  }
}

// Singleton instance
export const wsManager = new WebSocketManager();