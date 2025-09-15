#!/bin/bash

echo "🔧 Starting complete SDK 53 fix..."

# Make the script executable
chmod +x fix-sdk53-complete.js

# Run the fix script
node fix-sdk53-complete.js

echo "✅ Fix script completed!"
echo ""
echo "🚀 Now try starting the app:"
echo "npx expo start --web --tunnel"