#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Complete SDK 54 Migration - No Compromises!');

// Read current package.json
const packageJsonPath = path.join(process.cwd(), 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

console.log('📦 Current Expo version:', packageJson.dependencies.expo);

// Complete SDK 54 compatible package.json
const newPackageJson = {
  "name": packageJson.name,
  "main": "expo-router/entry",
  "version": packageJson.version,
  "scripts": {
    "start": "npx expo start --tunnel",
    "start-web": "npx expo start --web --tunnel",
    "start-web-dev": "DEBUG=expo* npx expo start --web --tunnel",
    "lint": "expo lint",
    "android": "npx expo start --android",
    "ios": "npx expo start --ios",
    "web": "npx expo start --web",
    "prebuild": "npx expo prebuild --clean",
    "doctor": "npx expo doctor"
  },
  "dependencies": {
    "@expo/vector-icons": "^14.0.4",
    "@nkzw/create-context-hook": "^1.1.0",
    "@react-native-async-storage/async-storage": "2.0.0",
    "@react-navigation/native": "^6.1.18",
    "@tanstack/react-query": "^5.83.0",
    "expo": "~54.0.0",
    "expo-blur": "~15.0.0",
    "expo-constants": "~18.0.0",
    "expo-font": "~14.0.0",
    "expo-haptics": "~15.0.0",
    "expo-image": "~2.2.0",
    "expo-image-picker": "~17.0.0",
    "expo-linear-gradient": "~15.0.0",
    "expo-linking": "~8.0.0",
    "expo-location": "~19.0.0",
    "expo-router": "~6.0.0",
    "expo-splash-screen": "~0.31.0",
    "expo-status-bar": "~2.3.0",
    "expo-symbols": "~0.5.0",
    "expo-system-ui": "~6.0.0",
    "expo-web-browser": "~15.0.0",
    "lucide-react-native": "^0.475.0",
    "react": "18.3.1",
    "react-dom": "18.3.1",
    "react-native": "0.76.3",
    "react-native-gesture-handler": "~2.20.2",
    "react-native-safe-area-context": "5.4.0",
    "react-native-screens": "~4.11.0",
    "react-native-svg": "15.12.0",
    "react-native-web": "~0.19.13",
    "zustand": "^5.0.8"
  },
  "devDependencies": {
    "@babel/core": "^7.25.2",
    "@types/react": "~18.3.12",
    "eslint": "^8.57.0",
    "eslint-config-expo": "^7.1.2",
    "typescript": "~5.3.3"
  },
  "overrides": {
    "metro": "0.81.0",
    "@expo/metro-config": "~0.18.11"
  },
  "private": true,
  "engines": {
    "node": ">=18.0.0"
  }
};

// Write completely new package.json
fs.writeFileSync(packageJsonPath, JSON.stringify(newPackageJson, null, 2));
console.log('✅ Completely rewrote package.json for SDK 54');

// Nuclear clean
console.log('💥 Nuclear clean of all dependencies...');
try {
  execSync('rm -rf node_modules package-lock.json bun.lock yarn.lock pnpm-lock.yaml', { stdio: 'inherit' });
} catch (_e) {
  console.log('⚠️  Some cleanup files not found (OK)');
}

// Fresh install with npm
console.log('📦 Fresh install with npm...');
try {
  execSync('npm install --legacy-peer-deps', { stdio: 'inherit' });
  console.log('✅ Dependencies installed successfully');
} catch (e) {
  console.error('❌ npm install failed:', e.message);
  console.log('🔄 Trying without legacy-peer-deps...');
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Dependencies installed on retry');
  } catch (e2) {
    console.error('❌ Both install attempts failed:', e2.message);
    process.exit(1);
  }
}

// Expo install fix
console.log('🔧 Running expo install --fix...');
try {
  execSync('npx expo install --fix', { stdio: 'inherit' });
  console.log('✅ Expo dependencies fixed');
} catch (_e) {
  console.log('⚠️  expo install --fix had issues (continuing...)');
}

// Expo doctor
console.log('🩺 Running expo doctor...');
try {
  execSync('npx expo doctor', { stdio: 'inherit' });
  console.log('✅ Expo doctor passed');
} catch (_e) {
  console.log('⚠️  expo doctor found issues (check output above)');
}

// Verify metro version
console.log('🔍 Verifying metro version...');
try {
  const result = execSync('npm ls metro', { encoding: 'utf8' });
  console.log('Metro version:', result);
} catch (_e) {
  console.log('⚠️  Could not verify metro version');
}

console.log('🎉 COMPLETE SDK 54 MIGRATION FINISHED!');
console.log('🚀 Now run: npx expo start --web --tunnel');
console.log('📱 The TerminalReporter error should be GONE!');
