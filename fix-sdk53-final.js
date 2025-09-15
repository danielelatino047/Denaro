#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing package.json for Expo SDK 53 compatibility...');

const packageJsonPath = path.join(process.cwd(), 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Fix scripts to use npm instead of bun
packageJson.scripts = {
  "start": "npx expo start --tunnel",
  "start-web": "npx expo start --web --tunnel", 
  "start-web-dev": "DEBUG=expo* npx expo start --web --tunnel",
  "lint": "expo lint",
  "android": "npx expo start --android",
  "ios": "npx expo start --ios", 
  "web": "npx expo start --web",
  "dev": "npx expo start --web --tunnel"
};

// Remove all SDK 54 packages
delete packageJson.dependencies['@expo/cli'];
delete packageJson.dependencies['@expo/config-plugins'];
delete packageJson.dependencies['@expo/metro-config'];
delete packageJson.dependencies['@expo/prebuild-config'];
delete packageJson.dependencies['babel-preset-expo'];

// Fix expo version to exact 53.0.4
packageJson.dependencies.expo = "53.0.4";

// Add required packages for SDK 53
packageJson.dependencies.ajv = "^8.17.1";
packageJson.dependencies["ajv-keywords"] = "^5.1.0";
packageJson.dependencies.metro = "0.76.7";

// Add overrides to force correct versions
packageJson.overrides = {
  "metro": "0.76.7",
  "@expo/metro-config": "^53.0.0"
};

// Write the fixed package.json
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

console.log('✅ package.json fixed for SDK 53');
console.log('📦 Fixed versions:');
console.log('  - expo: 53.0.4 (exact)');
console.log('  - metro: 0.76.7 (exact)');
console.log('  - Removed all SDK 54 packages');
console.log('  - Added npm overrides');
console.log('  - Changed scripts to use npx instead of bun');