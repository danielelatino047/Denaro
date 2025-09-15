#!/bin/bash

# Release Build Script for ArbitrageSwap AI
# This script creates a production-ready build

echo "🚀 Starting Release Build Process..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf android/
rm -rf ios/
rm -rf node_modules/.cache/
rm -rf .expo/

# Install dependencies with clean cache
echo "📦 Installing dependencies..."
npm cache clean --force
npm install --legacy-peer-deps

# Run prebuild for native platforms
echo "🔨 Running expo prebuild..."
npx expo prebuild --clean --platform android --no-install

# Check if android directory was created
if [ ! -d "android" ]; then
    echo "❌ Error: Android directory not created. Prebuild failed."
    exit 1
fi

echo "✅ Android project generated successfully!"

# Build release APK
echo "📱 Building release APK..."
cd android

# Clean gradle cache
./gradlew clean

# Build release APK
./gradlew assembleRelease

# Check if APK was built
APK_PATH="app/build/outputs/apk/release/app-release.apk"
if [ -f "$APK_PATH" ]; then
    echo "✅ Release APK built successfully!"
    echo "📍 APK location: android/$APK_PATH"
    
    # Copy APK to root directory for easy access
    cp "$APK_PATH" "../arbitrageswap-ai-release.apk"
    echo "📋 APK copied to: arbitrageswap-ai-release.apk"
else
    echo "❌ Error: Release APK not found at $APK_PATH"
    exit 1
fi

cd ..

echo "🎉 Release build completed successfully!"
echo "📱 Your APK is ready: arbitrageswap-ai-release.apk"