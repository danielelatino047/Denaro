#!/bin/bash

echo "🔧 Fixing SDK 53 Metro TerminalReporter issue..."

# Remove problematic lockfiles and node_modules
echo "📦 Cleaning dependencies..."
rm -rf node_modules
rm -f package-lock.json
rm -f bun.lock
rm -f yarn.lock

# Install with npm (not bun)
echo "📥 Installing with npm..."
npm install

# Fix Metro version specifically
echo "🚇 Fixing Metro version..."
npm install metro@0.76.7 --save-dev

# Run Expo fixes
echo "🔧 Running Expo fixes..."
npx expo install --fix
npx expo doctor --fix

echo "✅ SDK 53 fixes applied!"
echo "🚀 Now run: npx expo start --web --tunnel"