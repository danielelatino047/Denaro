#!/bin/bash

echo "=== FINAL DEPENDENCY FIX ==="

# Remove all problematic files
echo "🧹 Cleaning environment..."
rm -rf node_modules
rm -f package-lock.json
rm -f bun.lock

# Clear npm cache
echo "📦 Clearing npm cache..."
npm cache clean --force

# Install only core dependencies first
echo "📦 Installing core dependencies..."
npm install --no-package-lock --legacy-peer-deps

# Force install specific versions to avoid conflicts
echo "📦 Installing specific versions..."
npm install ajv@8.12.0 --save-dev --legacy-peer-deps
npm install ajv-keywords@5.1.0 --save-dev --legacy-peer-deps
npm install schema-utils@4.2.0 --save-dev --legacy-peer-deps

# Run prebuild
echo "🚀 Running expo prebuild..."
npx expo prebuild --clean --platform android --no-install

# Check if android directory was created
if [ -d "android" ]; then
    echo "✅ SUCCESS: Android directory created!"
    ls -la android/
else
    echo "❌ FAILED: Android directory not created"
    echo "Current directory contents:"
    ls -la
fi