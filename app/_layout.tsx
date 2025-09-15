import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { usePortfolioStore } from "../stores/portfolio-store";
import { useWalletStore } from "../stores/wallet-store";
import { useSettingsStore } from "../stores/settings-store";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

function RootLayoutNav() {
  const { initializePortfolio, isInitialized: portfolioInitialized } = usePortfolioStore();
  const { initializeWallet, isInitialized: walletInitialized } = useWalletStore();
  const { loadSettings } = useSettingsStore();

  useEffect(() => {
    // Initialize all stores
    const initializeStores = async () => {
      await loadSettings();
      
      if (!portfolioInitialized) {
        await initializePortfolio();
      }
      
      if (!walletInitialized) {
        await initializeWallet();
      }
    };
    
    initializeStores();
  }, [portfolioInitialized, walletInitialized, initializePortfolio, initializeWallet, loadSettings]);

  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={styles.container}>
        <RootLayoutNav />
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
