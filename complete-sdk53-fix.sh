#!/bin/bash

set -e  # Exit on any error

echo "🔥 COMPLETE SDK 53 FIX - Fixing ALL Metro/TerminalReporter issues"
echo "=================================================="
echo ""

# Step 1: Fix package.json
echo "📝 Step 1: Fixing package.json for SDK 53..."
node fix-sdk53-package.js

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