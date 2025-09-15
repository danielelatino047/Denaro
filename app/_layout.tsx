import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, ActivityIndicator, Platform } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import ErrorBoundary from "../components/ErrorBoundary";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

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
});

function RootLayoutNav() {
  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    async function initializeApp() {
      try {
        console.log('🚀 Starting minimal app initialization...');
        
        // Minimal initialization - just wait a moment
        await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log('✅ App initialization complete');
        setIsAppReady(true);
        
        // Hide splash screen
        await SplashScreen.hideAsync();
        console.log('✅ Splash screen hidden');
        
      } catch (error) {
        console.error('❌ App initialization error:', error);
        setIsAppReady(true); // Still show the app
        
        try {
          await SplashScreen.hideAsync();
        } catch (splashError) {
          console.error('Error hiding splash screen:', splashError);
        }
      }
    }

    initializeApp();
  }, []);

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
        <View style={styles.container}>
          <RootLayoutNav />
        </View>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
