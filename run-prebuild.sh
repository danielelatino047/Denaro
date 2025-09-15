#!/bin/bash
set -e

echo "=== Starting Expo Prebuild Process ==="

# Check if expo CLI is available
echo "Checking Expo CLI..."
npx expo --version

# Clean any existing android directory
if [ -d "android" ]; then
  echo "Removing existing android directory..."
  rm -rf android
fi

# Run expo prebuild
echo "Running expo prebuild..."
npx expo prebuild --platform android --clean --no-install

# Verify android directory was created
if [ -d "android" ]; then
  echo "✅ Android directory created successfully!"
  echo ""
  echo "Directory contents:"
  ls -la android/
  echo ""
  
  # Check essential files
  echo "Checking essential files:"
  
  if [ -f "android/gradlew" ]; then
    echo "✅ gradlew found"
  else
    echo "❌ gradlew missing"
  fi
  
  if [ -f "android/app/build.gradle" ]; then
    echo "✅ app/build.gradle found"
  else
    echo "❌ app/build.gradle missing"
  fi
  
  if [ -f "android/settings.gradle" ]; then
    echo "✅ settings.gradle found"
  else
    echo "❌ settings.gradle missing"
  fi
  
  if [ -d "android/app/src/main" ]; then
    echo "✅ app/src/main directory found"
  else
    echo "❌ app/src/main directory missing"
  fi
  
  echo ""
  echo "=== Prebuild completed successfully! ==="
else
  echo "❌ Android directory was not created!"
  echo "Current directory contents:"
  ls -la
  exit 1
fi