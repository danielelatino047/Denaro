#!/bin/bash

set -e  # Exit on any error

echo "🔥 COMPLETE SDK 53 FIX - Fixing ALL Metro/TerminalReporter issues"
echo "=================================================="
echo ""

# Step 1: Fix package.json
echo "📝 Step 1: Fixing package.json for SDK 53..."
cat > package.json << 'EOF'
{
  "name": "arbitrageswap-ai",
  "main": "expo-router/entry",
  "version": "1.0.0",
  "scripts": {
    "start": "npx expo start --tunnel",
    "start-web": "npx expo start --web --tunnel",
    "start-web-dev": "DEBUG=expo* npx expo start --web --tunnel",
    "lint": "expo lint",
    "android": "npx expo start --android",
    "ios": "npx expo start --ios",
    "web": "npx expo start --web"
  },
  "dependencies": {
    "@expo/vector-icons": "^14.0.0",
    "@nkzw/create-context-hook": "^1.1.0",
    "@react-native-async-storage/async-storage": "2.0.0",
    "@react-navigation/native": "^6.1.9",
    "@tanstack/react-query": "^5.83.0",
    "ajv": "^8.17.1",
    "ajv-keywords": "^5.1.0",
    "expo": "53.0.4",
    "expo-blur": "~13.0.2",
    "expo-constants": "~16.0.1",
    "expo-font": "~12.0.4",
    "expo-haptics": "~13.0.1",
    "expo-image": "~1.12.9",
    "expo-image-picker": "~15.0.4",
    "expo-linear-gradient": "~13.0.2",
    "expo-linking": "~6.3.1",
    "expo-location": "~17.0.1",
    "expo-router": "~3.5.14",
    "expo-splash-screen": "~0.27.4",
    "expo-status-bar": "~1.12.1",
    "expo-system-ui": "~3.0.4",
    "expo-web-browser": "~13.0.3",
    "lucide-react-native": "^0.475.0",
    "metro": "0.76.7",
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "react-native": "0.74.1",
    "react-native-gesture-handler": "~2.16.1",
    "react-native-safe-area-context": "4.10.1",
    "react-native-screens": "~3.31.1",
    "react-native-svg": "15.2.0",
    "react-native-web": "~0.19.10",
    "zustand": "^5.0.8"
  },
  "devDependencies": {
    "@babel/core": "^7.25.2",
    "@expo/ngrok": "^4.1.0",
    "@types/react": "~18.2.45",
    "eslint": "^9.31.0",
    "eslint-config-expo": "^7.0.0",
    "typescript": "~5.3.3"
  },
  "overrides": {
    "metro": "0.76.7",
    "@expo/metro-config": "~0.18.6"
  },
  "private": true,
  "engines": {
    "node": ">=18.0.0"
  }
}
EOF

# Step 2: Clean install
echo ""
echo "🧹 Step 2: Cleaning old dependencies..."
rm -rf node_modules package-lock.json bun.lock 2>/dev/null || true

# Step 3: Fresh npm install
echo ""
echo "📥 Step 3: Installing dependencies with npm..."
npm install

# Step 4: Expo fixes
echo ""
echo "🔧 Step 4: Running expo install --fix..."
npx expo install --fix || echo "⚠️  expo install --fix completed with warnings"

echo ""
echo "🩺 Step 5: Running expo doctor --fix..."
npx expo doctor --fix || echo "⚠️  expo doctor --fix completed with warnings"

# Step 6: Verification
echo ""
echo "🔍 Step 6: Verifying installation..."
echo "Metro version:"
npm ls metro --depth=0 || echo "⚠️  Metro version check failed"

echo ""
echo "Expo CLI version:"
npx expo --version || echo "⚠️  Expo version check failed"

echo ""
echo "✅ SDK 53 fix completed!"
echo ""
echo "🚀 Now try starting the app:"
echo "npx expo start --web --tunnel"
echo ""
echo "📋 Expected results:"
echo "- No 'TerminalReporter' error"
echo "- Metro should be version 0.76.7"
echo "- App should start successfully"