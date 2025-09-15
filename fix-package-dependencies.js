#!/usr/bin/env node

/**
 * Fix Package Dependencies Script
 * 
 * This script removes problematic packages that cause prebuild issues
 * and adds the required ajv dependencies for Expo prebuild to work.
 * 
 * Run this script to fix the package.json dependencies:
 * node fix-package-dependencies.js
 */

const fs = require('fs');
const path = require('path');

const packageJsonPath = path.join(process.cwd(), 'package.json');

console.log('🔧 Fixing package.json dependencies...');

try {
  // Read current package.json
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // Remove problematic packages
  const problematicPackages = [
    'nativewind',
    '@stardazed/streams-text-encoding',
    '@ungap/structured-clone'
  ];
  
  console.log('❌ Removing problematic packages:');
  problematicPackages.forEach(pkg => {
    if (packageJson.dependencies[pkg]) {
      console.log(`   - ${pkg}`);
      delete packageJson.dependencies[pkg];
    }
  });
  
  // Add required ajv packages for prebuild
  console.log('✅ Adding required ajv packages:');
  const requiredPackages = {
    'ajv': '^8.17.1',
    'ajv-keywords': '^5.1.0'
  };
  
  Object.entries(requiredPackages).forEach(([pkg, version]) => {
    console.log(`   + ${pkg}@${version}`);
    packageJson.dependencies[pkg] = version;
  });
  
  // Write updated package.json
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
  
  console.log('✅ Package.json updated successfully!');
  console.log('');
  console.log('Next steps:');
  console.log('1. Run: rm -rf node_modules package-lock.json bun.lock');
  console.log('2. Run: npm install --legacy-peer-deps');
  console.log('3. Run: npx expo prebuild --platform android --clean');
  console.log('');
  
} catch (error) {
  console.error('❌ Error fixing package.json:', error.message);
  process.exit(1);
}