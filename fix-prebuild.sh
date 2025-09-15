#!/bin/bash

echo "=== Fixing Dependency Issues ==="

# Remove problematic packages
npm uninstall nativewind @stardazed/streams-text-encoding @ungap/structured-clone

# Clear npm cache
npm cache clean --force

# Remove node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Install dependencies fresh
npm install

echo "=== Running Expo Prebuild ==="

# Run prebuild with clean environment
npx expo prebuild --clean --platform android

echo "=== Checking Results ==="

if [ -d "android" ]; then
    echo "✅ Android directory created successfully!"
    ls -la android/
else
    echo "❌ Android directory not found!"
    exit 1
fi