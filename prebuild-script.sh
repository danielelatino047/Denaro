#!/bin/bash
set -e

echo "=== Running Expo Prebuild ==="

# Clean any existing android directory
rm -rf android

# Run expo prebuild
npx expo prebuild --platform android --clean --no-install

# Check if android directory was created
if [ -d "android" ]; then
  echo "✅ Android directory created successfully!"
  echo "Android directory structure:"
  ls -la android/
  
  # Check for essential files
  if [ -f "android/gradlew" ]; then
    echo "✅ gradlew found"
  else
    echo "❌ gradlew not found"
  fi
  
  if [ -f "android/app/build.gradle" ]; then
    echo "✅ build.gradle found"
  else
    echo "❌ build.gradle not found"
  fi
  
  if [ -f "android/settings.gradle" ]; then
    echo "✅ settings.gradle found"
  else
    echo "❌ settings.gradle not found"
  fi
else
  echo "❌ Android directory was not created!"
  exit 1
fi

echo "=== Prebuild completed successfully ==="