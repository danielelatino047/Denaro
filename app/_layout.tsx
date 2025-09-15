import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState, useCallback } from "react";
import { StyleSheet, View, Text, ActivityIndicator } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { usePortfolioStore } from "../stores/portfolio-store";
import { useWalletStore } from "../stores/wallet-store";
import { useSettingsStore } from "../stores/settings-store";
import ErrorBoundary from "../components/ErrorBoundary";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Create query client with error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1F2937',
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 16,
    fontSize: 16,
  },
});

function RootLayoutNav() {
  const [isAppReady, setIsAppReady] = useState(false);
  const { initializePortfolio, isInitialized: portfolioInitialized } = usePortfolioStore();
  const { initializeWallet, isInitialized: walletInitialized } = useWalletStore();
  const { loadSettings } = useSettingsStore();

  const initializeApp = useCallback(async () => {
    try {
      console.log('Starting app initialization...');
      
      // Load settings first
      await loadSettings();
      console.log('Settings loaded');
      
      // Initialize stores in parallel with error handling
      const initPromises = [];
      
      if (!portfolioInitialized) {
        initPromises.push(
          initializePortfolio().catch(error => {
            console.error('Portfolio initialization failed:', error);
            return null;
          })
        );
      }
      
      if (!walletInitialized) {
        initPromises.push(
          initializeWallet().catch(error => {
            console.error('Wallet initialization failed:', error);
            return null;
          })
        );
      }
      
      await Promise.allSettled(initPromises);
      console.log('All stores initialized');
      
      // Small delay to ensure everything is ready
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setIsAppReady(true);
      
      // Hide splash screen after initialization
      await SplashScreen.hideAsync();
      console.log('App ready, splash screen hidden');
      
    } catch (error) {
      console.error('App initialization error:', error);
      // Still mark as ready to prevent infinite loading
      setIsAppReady(true);
      await SplashScreen.hideAsync();
    }
  }, [portfolioInitialized, walletInitialized, initializePortfolio, initializeWallet, loadSettings]);

  useEffect(() => {
    initializeApp();
  }, [initializeApp]);

  if (!isAppReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00D4AA" />
        <Text style={styles.loadingText}>Loading ArbitrageSwap AI...</Text>
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={styles.container}>
            <RootLayoutNav />
          </GestureHandlerRootView>
        </QueryClientProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
