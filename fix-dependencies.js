#!/usr/bin/env node

/**
 * Dependency Resolution Fix for ArbitrageSwap AI
 * Fixes the ajv/dist/compile/codegen module resolution issue
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Starting dependency resolution fix...');

// Read current package.json
const packageJsonPath = path.join(process.cwd(), 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Add resolutions to fix ajv issues
if (!packageJson.resolutions) {
  packageJson.resolutions = {};
}

// Fix ajv version conflicts
packageJson.resolutions = {
  ...packageJson.resolutions,
  "ajv": "^8.17.1",
  "ajv-keywords": "^5.1.0",
  "schema-utils": "^4.2.0"
};

// Add overrides for npm
if (!packageJson.overrides) {
  packageJson.overrides = {};
}

packageJson.overrides = {
  ...packageJson.overrides,
  "ajv": "^8.17.1",
  "ajv-keywords": "^5.1.0",
  "schema-utils": "^4.2.0"
};

// Write updated package.json
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
console.log('✅ Updated package.json with dependency resolutions');

// Clean and reinstall
console.log('🧹 Cleaning node_modules and package-lock.json...');
try {
  execSync('rm -rf node_modules package-lock.json', { stdio: 'inherit' });
} catch (_error) {
  console.log('Note: Some files may not exist, continuing...');
}

console.log('📦 Installing dependencies with fixed resolutions...');
try {
  execSync('npm install --legacy-peer-deps --force', { stdio: 'inherit' });
  console.log('✅ Dependencies installed successfully');
} catch (error) {
  console.error('❌ Error installing dependencies:', error.message);
  process.exit(1);
}

// Verify ajv installation
console.log('🔍 Verifying ajv installation...');
try {
  const ajvPath = path.join(process.cwd(), 'node_modules', 'ajv', 'dist', 'compile', 'codegen.js');
  if (fs.existsSync(ajvPath)) {
    console.log('✅ ajv/dist/compile/codegen.js found - fix successful!');
  } else {
    console.log('⚠️  ajv/dist/compile/codegen.js not found, but installation completed');
  }
} catch (_error) {
  console.log('⚠️  Could not verify ajv installation, but process completed');
}

console.log('🎉 Dependency resolution fix completed!');
console.log('💡 You can now run: npx expo prebuild --clean --platform android');