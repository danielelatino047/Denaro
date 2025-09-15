#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

console.log('🔧 Starting SDK 53 Metro fix...');

// Read current package.json
const packageJsonPath = './package.json';
let packageJson;

try {
  packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  console.log('📦 Current Expo version:', packageJson.dependencies.expo);
} catch (error) {
  console.error('❌ Could not read package.json:', error.message);
  process.exit(1);
}

// Create backup
const backupPath = './package.json.backup';
fs.writeFileSync(backupPath, JSON.stringify(packageJson, null, 2));
console.log('💾 Created backup at package.json.backup');

// Fix package.json for SDK 53 compatibility
const fixedPackageJson = {
  ...packageJson,
  scripts: {
    ...packageJson.scripts,
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
    // Fix Expo SDK to 53.0.4 (remove caret)
    expo: '53.0.4',
    // Keep only SDK 53 compatible @expo packages
    '@expo/metro-config': '^53.0.0'
  }
};

// Remove SDK 54 packages that cause conflicts
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

// Add npm overrides for Metro compatibility
fixedPackageJson.overrides = {
  metro: '0.76.7',
  '@expo/metro-config': '^53.0.0'
};

// Write fixed package.json
try {
  fs.writeFileSync(packageJsonPath, JSON.stringify(fixedPackageJson, null, 2));
  console.log('✅ Updated package.json for SDK 53 compatibility');
} catch (error) {
  console.error('❌ Could not write package.json:', error.message);
  process.exit(1);
}

console.log('');
console.log('🧹 Next steps to complete the fix:');
console.log('1. rm -rf node_modules package-lock.json bun.lock');
console.log('2. npm install');
console.log('3. npx expo install --fix');
console.log('4. npx expo doctor --fix');
console.log('5. npx expo start --web --tunnel');
console.log('');
console.log('📋 Acceptance criteria:');
console.log('- npm ls metro should show metro@0.76.7');
console.log('- npx expo start --web --tunnel should start without TerminalReporter error');
console.log('');
console.log('🔄 To restore original package.json: cp package.json.backup package.json');