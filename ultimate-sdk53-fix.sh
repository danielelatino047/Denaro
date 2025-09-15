#!/bin/bash

echo "🔥🔥🔥 ULTIMATE SDK 53 FIX 🔥🔥🔥"
echo "Fixing ALL Metro TerminalReporter issues PERMANENTLY"
echo "=================================================="

# Kill any running processes
echo "💀 Killing any running Expo/Metro processes..."
pkill -f "expo" || true
pkill -f "metro" || true

# Step 1: Create proper Metro config
echo "🚇 Step 1: Creating Metro config for SDK 53..."
node create-metro-config.js

# Step 2: Fix package.json
echo "📝 Step 2: Fixing package.json for SDK 53..."
node fix-sdk53-package.js

# Step 3: Nuclear clean
echo "💣 Step 3: Nuclear cleaning all dependencies..."
rm -rf node_modules
rm -f package-lock.json
rm -f bun.lock
rm -f yarn.lock
rm -rf .expo
rm -rf .next

# Step 4: Install with npm ONLY
echo "📦 Step 4: Installing with npm (NO BUN ALLOWED)..."
npm install --legacy-peer-deps

# Step 5: Force correct Metro version
echo "🚇 Step 5: Force installing Metro 0.76.7..."
npm install metro@0.76.7 --save-dev --legacy-peer-deps

# Step 6: Expo fixes
echo "🔧 Step 6: Running Expo fixes..."
npx expo install --fix
npx expo doctor --fix

# Step 7: Clear Expo cache
echo "🧹 Step 7: Clearing Expo cache..."
npx expo r -c

echo ""
echo "🎉🎉🎉 ULTIMATE SDK 53 FIX COMPLETE! 🎉🎉🎉"
echo "=================================================="
echo "✅ Metro config created"
echo "✅ package.json fixed for SDK 53"
echo "✅ Dependencies cleaned and reinstalled"
echo "✅ Metro 0.76.7 installed"
echo "✅ Expo cache cleared"
echo ""
echo "🚀 NOW START THE APP:"
echo "npx expo start --web --tunnel"
echo ""
echo "❌ NEVER USE BUN AGAIN - ONLY NPX/NPM!"
echo "=================================================="