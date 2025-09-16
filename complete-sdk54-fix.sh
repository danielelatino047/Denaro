#!/bin/bash

echo "🔧 Fixing Expo SDK 54 compatibility issues..."

# Run the Node.js script to update package.json and install dependencies
node fix-sdk54-complete.js

# Verify the installation
echo ""
echo "🔍 Verifying installation..."
echo "Metro version:"
npm ls metro 2>/dev/null || echo "Metro not found in direct dependencies (OK - managed by Expo)"

echo ""
echo "Expo CLI version:"
npx expo --version

echo ""
echo "✅ All done! The app should now work with SDK 54."
echo "🚀 Run this to start the app:"
echo "   npx expo start --web --tunnel"
echo ""
echo "📱 Or for mobile:"
echo "   npx expo start --tunnel"