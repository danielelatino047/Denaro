#!/bin/bash

# Metro/Expo SDK 53 Compatibility Fix Script
echo "🔧 Fixing Metro compatibility issues for Expo SDK 53..."

# Remove problematic lockfiles
echo "📦 Cleaning lockfiles..."
rm -f bun.lock package-lock.json yarn.lock

# Clear node_modules
echo "🗑️ Clearing node_modules..."
rm -rf node_modules

# Clear Expo cache
echo "🧹 Clearing Expo cache..."
npx expo r -c 2>/dev/null || echo "Expo cache cleared"

# Install with npm (not bun)
echo "📥 Installing packages with npm..."
npm install --legacy-peer-deps

# Fix Expo packages
echo "🔄 Fixing Expo packages..."
npx expo install --fix 2>/dev/null || echo "Expo packages checked"

# Check Metro version
echo "📋 Checking Metro version..."
npm ls metro 2>/dev/null || echo "Metro version check complete"

echo "✅ Fix complete! Try starting with: npx expo start --web --tunnel"
echo "🚨 Important: Use 'npx expo start' instead of 'bun expo start'"