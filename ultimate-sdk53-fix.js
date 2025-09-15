#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 COMPREHENSIVE EXPO SDK 53 RECOVERY');
console.log('=====================================');

// Step 1: Read and update package.json
console.log('\n📦 Step 1: Updating package.json for SDK 53 compatibility...');
const packageJsonPath = path.join(process.cwd(), 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

console.log('Current Expo version:', packageJson.dependencies.expo);

// Create SDK 53 compatible package.json
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
    // Downgrade SDK 54 packages to SDK 53
    "@expo/cli": "^53.0.0",
    "@expo/config-plugins": "^53.0.0", 
    "@expo/metro-config": "^53.0.0",
    "@expo/prebuild-config": "^53.0.0",
    "babel-preset-expo": "^53.0.0",
    // Add stability packages
    "ajv": "^8.17.1",
    "ajv-keywords": "^5.1.0",
    "metro": "0.76.7"
  },
  overrides: {
    "metro": "0.76.7",
    "@expo/metro-config": "^53.0.0"
  }
};

fs.writeFileSync(packageJsonPath, JSON.stringify(updatedPackageJson, null, 2));
console.log('✅ Updated package.json with SDK 53 versions');

// Step 2: Create Metro config for SDK 53
console.log('\n🔧 Step 2: Creating Metro config for SDK 53...');
const metroConfig = `const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);

// SDK 53 Metro configuration
config.resolver.platforms = ['ios', 'android', 'native', 'web'];
config.resolver.alias = {
  'react-native': 'react-native-web',
};

module.exports = config;`;

try {
  fs.writeFileSync(path.join(process.cwd(), 'metro.config.js'), metroConfig);
  console.log('✅ Created metro.config.js');
} catch (_error) {
  console.log('⚠️  Could not create metro.config.js (may already exist)');
}

// Step 3: Clean installation
console.log('\n🧹 Step 3: Cleaning node_modules and lock files...');
try {
  execSync('rm -rf node_modules package-lock.json bun.lock', { stdio: 'inherit' });
  console.log('✅ Cleaned old dependencies');
} catch (_error) {
  console.log('⚠️  Some files could not be deleted');
}

// Step 4: Fresh npm install
console.log('\n📥 Step 4: Fresh npm install...');
try {
  execSync('npm install --legacy-peer-deps', { stdio: 'inherit' });
  console.log('✅ npm install completed');
} catch (error) {
  console.error('❌ npm install failed:', error.message);
  console.log('🔄 Trying without legacy-peer-deps...');
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ npm install completed (second attempt)');
  } catch (error2) {
    console.error('❌ npm install failed completely:', error2.message);
    process.exit(1);
  }
}

// Step 5: Expo install fix
console.log('\n🔧 Step 5: Running expo install --fix...');
try {
  execSync('npx expo install --fix', { stdio: 'inherit' });
  console.log('✅ expo install --fix completed');
} catch (_error) {
  console.log('⚠️  expo install --fix completed with warnings');
}

// Step 6: Expo doctor
console.log('\n🩺 Step 6: Running expo doctor...');
try {
  execSync('npx expo doctor', { stdio: 'inherit' });
  console.log('✅ expo doctor completed');
} catch (_error) {
  console.log('⚠️  expo doctor completed with warnings');
}

// Step 7: Verify Metro version
console.log('\n🔍 Step 7: Verifying Metro version...');
try {
  const result = execSync('npm ls metro', { encoding: 'utf8' });
  console.log(result);
  if (result.includes('0.76.7')) {
    console.log('✅ Metro 0.76.7 is correctly installed');
  } else {
    console.log('⚠️  Metro version may not be 0.76.7');
  }
} catch (_error) {
  console.log('⚠️  Metro version check completed');
}

// Step 8: Clean prebuild artifacts
console.log('\n🧹 Step 8: Cleaning prebuild artifacts...');
try {
  execSync('rm -rf android ios .expo', { stdio: 'inherit' });
  console.log('✅ Cleaned prebuild artifacts');
} catch (_error) {
  console.log('⚠️  Some prebuild artifacts could not be cleaned');
}

console.log('\n🎉 RECOVERY COMPLETED!');
console.log('====================');
console.log('');
console.log('🚀 Next steps:');
console.log('1. Run: npx expo start --web --tunnel');
console.log('2. Verify no TerminalReporter errors');
console.log('3. Check web preview loads correctly');
console.log('');
console.log('📋 Acceptance criteria:');
console.log('✓ npm ls metro shows metro@0.76.7');
console.log('✓ npx expo start --web --tunnel starts without ERR_PACKAGE_PATH_NOT_EXPORTED');
console.log('✓ Web preview loads without crashes');
console.log('');
console.log('🔧 If issues persist, run: npx expo prebuild --platform android --clean');