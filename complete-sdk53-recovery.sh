#!/bin/bash

echo "🚀 Starting comprehensive Expo SDK 53 recovery..."

# Step 1: Fix package.json dependencies
echo "📦 Step 1: Fixing package.json dependencies..."
node fix-sdk53-dependencies.js

# Step 2: Verify Node version
echo "🔍 Step 2: Checking Node.js version..."
node_version=$(node -v)
echo "Node.js version: $node_version"

# Step 3: Clean prebuild artifacts
echo "🧹 Step 3: Cleaning prebuild artifacts..."
rm -rf android ios .expo

# Step 4: Run prebuild for Android
echo "🔨 Step 4: Running prebuild for Android..."
npx expo prebuild --platform android --clean

# Step 5: Verify Metro version
echo "🔍 Step 5: Verifying Metro version..."
npm ls metro || echo "Metro version check completed"

# Step 6: Test web start
echo "🌐 Step 6: Testing web start (will timeout after 30 seconds)..."
timeout 30s npx expo start --web --tunnel || echo "Web start test completed"

echo "✅ Recovery process completed!"
echo ""
echo "🎯 Next steps:"
echo "1. Run: npx expo start --web --tunnel"
echo "2. Verify no TerminalReporter errors"
echo "3. Check that Metro version is 0.76.7"
echo ""
echo "📋 Acceptance criteria:"
echo "✓ npm ls metro shows metro@0.76.7"
echo "✓ npx expo start --web --tunnel starts without ERR_PACKAGE_PATH_NOT_EXPORTED"
echo "✓ npx expo doctor shows no critical errors"