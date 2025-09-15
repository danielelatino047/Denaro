#!/bin/bash

echo "=== Running Expo Prebuild ==="

# Clean up any existing android directory
rm -rf android

# Run expo prebuild
npx expo prebuild --platform android --clean --no-install

# Check if android directory was created
if [ -d "android" ]; then
  echo "✅ Android directory created successfully!"
  echo ""
  echo "Contents of android directory:"
  ls -la android/
  echo ""
  echo "Checking essential files:"
  
  if [ -f "android/gradlew" ]; then
    echo "✅ gradlew found"
  else
    echo "❌ gradlew not found"
  fi
  
  if [ -f "android/app/build.gradle" ]; then
    echo "✅ app/build.gradle found"
  else
    echo "❌ app/build.gradle not found"
  fi
  
  if [ -f "android/settings.gradle" ]; then
    echo "✅ settings.gradle found"
  else
    echo "❌ settings.gradle not found"
  fi
  
  echo ""
  echo "=== Android project generated successfully! ==="
else
  echo "❌ Android directory was not created!"
  echo "Current directory contents:"
  ls -la
fi