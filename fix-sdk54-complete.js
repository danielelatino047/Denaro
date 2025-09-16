#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Fixing Expo SDK 54 compatibility issues...');

// Read current package.json
const packageJsonPath = path.join(process.cwd(), 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

console.log('📦 Current Expo version:', packageJson.dependencies.expo);

// Update to SDK 54 compatible versions
const sdk54Updates = {
  "expo": "^54.0.5",
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
  "react-native-safe-area-context": "5.4.0",
  "react-native-screens": "~4.11.0",
  "react-native-svg": "15.12.0"
};

// Update package.json
Object.keys(sdk54Updates).forEach(pkg => {
  if (packageJson.dependencies[pkg]) {
    console.log(`📝 Updating ${pkg}: ${packageJson.dependencies[pkg]} → ${sdk54Updates[pkg]}`);
    packageJson.dependencies[pkg] = sdk54Updates[pkg];
  }
});

// Update scripts to use npm instead of bun
packageJson.scripts = {
  ...packageJson.scripts,
  "start": "npx expo start --tunnel",
  "start-web": "npx expo start --web --tunnel", 
  "start-web-dev": "DEBUG=expo* npx expo start --web --tunnel",
  "android": "npx expo start --android",
  "ios": "npx expo start --ios",
  "web": "npx expo start --web"
};

// Write updated package.json
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
console.log('✅ Updated package.json with SDK 54 versions');

// Clean install process
console.log('🧹 Cleaning old dependencies...');
try {
  execSync('rm -rf node_modules package-lock.json bun.lock', { stdio: 'inherit' });
} catch (_e) {
  console.log('⚠️  Some cleanup files not found (OK)');
}

console.log('📦 Installing dependencies with npm...');
try {
  execSync('npm install', { stdio: 'inherit' });
} catch (_e) {
  console.error('❌ npm install failed:', _e.message);
  process.exit(1);
}

console.log('🔧 Running expo install --fix...');
try {
  execSync('npx expo install --fix', { stdio: 'inherit' });
} catch (_e) {
  console.log('⚠️  expo install --fix had issues (continuing...)');
}

console.log('🩺 Running expo doctor...');
try {
  execSync('npx expo doctor', { stdio: 'inherit' });
} catch (_e) {
  console.log('⚠️  expo doctor found issues (check output above)');
}

console.log('✅ SDK 54 migration complete!');
console.log('🚀 Try running: npx expo start --web --tunnel');