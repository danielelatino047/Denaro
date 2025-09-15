import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState, useCallback } from "react";
import { StyleSheet, View, Text, ActivityIndicator, Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import ErrorBoundary from "../components/ErrorBoundary";
import "../components/GlobalErrorHandler";

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
  webNotice: {
    color: '#9CA3AF',
    marginTop: 8,
    fontSize: 12,
    textAlign: 'center',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  errorDetails: {
    color: '#F87171',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
});

function RootLayoutNav() {
  const [isAppReady, setIsAppReady] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  const initializeApp = useCallback(async () => {
    try {
      console.log('🚀 Starting app initialization...');
      
      // Initialize stores safely
      try {
        const { useSettingsStore } = await import('../stores/settings-store');
        await useSettingsStore.getState().loadSettings();
        console.log('✅ Settings store initialized');
      } catch (error) {
        console.error('⚠️ Settings store initialization failed:', error);
      }
      
      try {
        const { usePortfolioStore } = await import('../stores/portfolio-store');
        await usePortfolioStore.getState().initializePortfolio();
        console.log('✅ Portfolio store initialized');
      } catch (error) {
        console.error('⚠️ Portfolio store initialization failed:', error);
      }
      
      try {
        const { useWalletStore } = await import('../stores/wallet-store');
        await useWalletStore.getState().initializeWallet();
        console.log('✅ Wallet store initialized');
      } catch (error) {
        console.error('⚠️ Wallet store initialization failed:', error);
      }
      
      setIsAppReady(true);
      
      // Hide splash screen after initialization
      await SplashScreen.hideAsync();
      console.log('✅ App ready, splash screen hidden');
      
    } catch (error) {
      console.error('❌ App initialization error:', error);
      setInitError(error instanceof Error ? error.message : 'Unknown error');
      // Still mark as ready to prevent infinite loading
      setIsAppReady(true);
      await SplashScreen.hideAsync();
    }
  }, []);

  useEffect(() => {
    initializeApp();
  }, [initializeApp]);

  if (!isAppReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00D4AA" />
        <Text style={styles.loadingText}>Loading ArbitrageSwap AI...</Text>
        {Platform.OS === 'web' && (
          <Text style={styles.webNotice}>Running in web preview mode</Text>
        )}
      </View>
    );
  }

  if (initError) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Initialization Error</Text>
        <Text style={styles.errorDetails}>{initError}</Text>
        <Text style={styles.loadingText}>App will continue with limited functionality</Text>
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
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
