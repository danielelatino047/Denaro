#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Fixing Expo SDK 53 dependencies...');

// Read current package.json
const packageJsonPath = path.join(process.cwd(), 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

console.log('📦 Current Expo version:', packageJson.dependencies.expo);

// Update package.json to fix SDK 53 compatibility
const updatedPackageJson = {
  ...packageJson,
  scripts: {
    ...packageJson.scripts,
    "start": "npx expo start --tunnel",
    "start-web": "npx expo start --web --tunnel", 
    "start-web-dev": "DEBUG=expo* npx expo start --web --tunnel",
    "dev": "npx expo start --web --tunnel",
    "android": "npx expo start --android",
    "ios": "npx expo start --ios",
    "web": "npx expo start --web",
    "lint": "expo lint"
  },
  dependencies: {
    ...packageJson.dependencies,
    // Fix SDK 53 versions
    "@expo/cli": "^53.0.0",
    "@expo/config-plugins": "^53.0.0", 
    "@expo/metro-config": "^53.0.0",
    "@expo/prebuild-config": "^53.0.0",
    "babel-preset-expo": "^53.0.0",
    // Add required packages for stability
    "ajv": "^8.17.1",
    "ajv-keywords": "^5.1.0",
    "metro": "0.76.7"
  },
  overrides: {
    "metro": "0.76.7",
    "@expo/metro-config": "^53.0.0"
  }
};

// Write updated package.json
fs.writeFileSync(packageJsonPath, JSON.stringify(updatedPackageJson, null, 2));
console.log('✅ Updated package.json with SDK 53 compatible versions');

// Clean install process
console.log('🧹 Cleaning node_modules and lock files...');
try {
  execSync('rm -rf node_modules package-lock.json bun.lock', { stdio: 'inherit' });
} catch (_error) {
  console.log('⚠️  Some files could not be deleted (may not exist)');
}

console.log('📥 Installing dependencies with npm...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ npm install completed');
} catch (error) {
  console.error('❌ npm install failed:', error.message);
  process.exit(1);
}

console.log('🔧 Running expo install --fix...');
try {
  execSync('npx expo install --fix', { stdio: 'inherit' });
  console.log('✅ expo install --fix completed');
} catch (error) {
  console.error('❌ expo install --fix failed:', error.message);
}

console.log('🩺 Running expo doctor --fix...');
try {
  execSync('npx expo doctor --fix', { stdio: 'inherit' });
  console.log('✅ expo doctor --fix completed');
} catch (error) {
  console.error('❌ expo doctor --fix failed:', error.message);
}

console.log('🔍 Checking Metro version...');
try {
  execSync('npm ls metro', { stdio: 'inherit' });
} catch (_error) {
  console.log('⚠️  Metro version check completed with warnings');
}

console.log('🎉 SDK 53 dependency fix completed!');
console.log('🚀 Try running: npx expo start --web --tunnel');