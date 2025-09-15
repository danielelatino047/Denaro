#!/bin/bash

echo "🚀 Starting complete SDK 53 recovery..."

# Step 1: Fix package.json
echo "📝 Step 1: Fixing package.json..."
node fix-sdk53-final.js

# Step 2: Clean all lock files and node_modules
echo "🧹 Step 2: Cleaning dependencies..."
rm -rf node_modules package-lock.json bun.lock yarn.lock

# Step 3: Install with npm (not bun)
echo "📦 Step 3: Installing dependencies with npm..."
npm install

# Step 4: Fix expo dependencies
echo "🔧 Step 4: Fixing expo dependencies..."
npx expo install --fix

# Step 5: Run expo doctor
echo "🩺 Step 5: Running expo doctor..."
npx expo doctor --fix

# Step 6: Verify versions
echo "✅ Step 6: Verifying versions..."
echo "Metro version:"
npm ls metro
echo ""
echo "Expo version:"
npx expo --version
echo ""
echo "Node version:"
node -v

echo ""
echo "🎉 Recovery complete!"
echo "Now run: npx expo start --web --tunnel"