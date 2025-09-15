#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

console.log('🔧 Starting complete SDK 53 fix...');

// Read current package.json
const packageJsonPath = path.join(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

console.log('📦 Current Expo version:', packageJson.dependencies.expo);

// Fix package.json for SDK 53 compatibility
const fixedPackageJson = {
  ...packageJson,
  scripts: {
    dev: 'npx expo start --web --tunnel',
    android: 'npx expo start --android',
    ios: 'npx expo start --ios',
    web: 'npx expo start --web',
    lint: 'npx expo lint',
    start: 'npx expo start --web --tunnel',
    'start-web': 'npx expo start --web --tunnel',
    'start-web-dev': 'DEBUG=expo* npx expo start --web --tunnel'
  },
  dependencies: {
    ...packageJson.dependencies,
    // Fix Expo SDK to 53.0.4 (no caret)
    expo: '53.0.4',
    // Add Metro 0.76.7 for SDK 53 compatibility
    metro: '0.76.7',
    // Add AJV fixes
    ajv: '^8.17.1',
    'ajv-keywords': '^5.1.0',
    // Keep only SDK 53 compatible @expo packages
    '@expo/metro-config': '^53.0.0'
  },
  overrides: {
    metro: '0.76.7',
    '@expo/metro-config': '^53.0.0'
  }
};

// Remove SDK 54 packages
const packagesToRemove = [
  '@expo/cli',
  '@expo/config-plugins', 
  '@expo/prebuild-config',
  'babel-preset-expo'
];

packagesToRemove.forEach(pkg => {
  if (fixedPackageJson.dependencies[pkg]) {
    console.log(`🗑️  Removing SDK 54 package: ${pkg}`);
    delete fixedPackageJson.dependencies[pkg];
  }
});

// Write fixed package.json
fs.writeFileSync(packageJsonPath, JSON.stringify(fixedPackageJson, null, 2));
console.log('✅ Fixed package.json for SDK 53');

// Clean install process
console.log('🧹 Cleaning node_modules and lock files...');
try {
  execSync('rm -rf node_modules package-lock.json bun.lock', { stdio: 'inherit' });
} catch (e) {
  console.log('⚠️  Some files may not exist, continuing...');
}

console.log('📥 Installing dependencies with npm...');
try {
  execSync('npm install', { stdio: 'inherit' });
} catch (e) {
  console.error('❌ npm install failed:', e.message);
  process.exit(1);
}

console.log('🔧 Running expo install --fix...');
try {
  execSync('npx expo install --fix', { stdio: 'inherit' });
} catch (e) {
  console.log('⚠️  expo install --fix had issues, continuing...');
}

console.log('🩺 Running expo doctor --fix...');
try {
  execSync('npx expo doctor --fix', { stdio: 'inherit' });
} catch (e) {
  console.log('⚠️  expo doctor --fix had issues, continuing...');
}

// Verify installation
console.log('\n🔍 Verifying installation...');
try {
  const metroVersion = execSync('npm ls metro --depth=0', { encoding: 'utf8' });
  console.log('Metro version:', metroVersion.trim());
} catch (e) {
  console.log('⚠️  Could not verify metro version');
}

try {
  const expoVersion = execSync('npx expo --version', { encoding: 'utf8' });
  console.log('Expo CLI version:', expoVersion.trim());
} catch (e) {
  console.log('⚠️  Could not verify expo version');
}

console.log('\n✅ SDK 53 fix complete!');
console.log('\n🚀 Try starting the app with: npx expo start --web --tunnel');
console.log('\n📋 Acceptance criteria:');
console.log('- npm ls metro should show metro@0.76.7');
console.log('- npx expo start --web --tunnel should start without TerminalReporter error');