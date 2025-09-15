#!/bin/bash

# Complete App Recovery Script
# This script fixes all issues preventing the app from running

echo "🚀 Starting Complete App Recovery..."
echo "=================================="

# Step 1: Fix package.json dependencies
echo "📦 Step 1: Fixing package.json dependencies..."
node fix-package-dependencies.js

if [ $? -ne 0 ]; then
    echo "❌ Failed to fix package.json. Exiting."
    exit 1
fi

# Step 2: Clean install
echo "🧹 Step 2: Cleaning node_modules and lock files..."
rm -rf node_modules package-lock.json bun.lock

echo "📥 Step 3: Installing dependencies..."
npm install --legacy-peer-deps

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies. Trying with --force..."
    npm install --legacy-peer-deps --force
fi

# Step 4: Check if app runs in preview
echo "🔍 Step 4: Testing app in preview mode..."
echo "The app should now work in preview mode."
echo "If you see any errors, check the console for details."

# Step 5: Android prebuild (optional)
echo "📱 Step 5: Android prebuild (optional)..."
echo "To create Android APK, run:"
echo "npx expo prebuild --platform android --clean"

echo ""
echo "✅ Recovery complete!"
echo "===================="
echo ""
echo "Next steps:"
echo "1. Test the app in preview mode"
echo "2. If preview works, run prebuild for Android APK"
echo "3. Check console for any remaining errors"
echo ""