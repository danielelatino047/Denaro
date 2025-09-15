#!/bin/bash
set -e

echo "🚀 Running comprehensive Android crash fix..."

# Run the fix
node fix-android-crash.js

echo "✅ Android crash fix completed!"
echo "📱 You can now build the APK with: ./build-debug-apk.sh"