import { Stack } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import ErrorBoundary from "../components/ErrorBoundary";

// Ensure proper initialization
console.log('📱 App Layout Loading...');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  console.log('🚀 App starting...');
  
  // Add error handling for startup
  React.useEffect(() => {
    console.log('✅ RootLayout mounted successfully');
    return () => {
      console.log('🔄 RootLayout unmounting');
    };
  }, []);

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
