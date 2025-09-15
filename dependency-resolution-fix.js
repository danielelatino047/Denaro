#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

console.log('🔧 Fixing dependency resolution conflicts...');

// Read current package.json
const packageJsonPath = path.join(process.cwd(), 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

console.log('📦 Original dependencies:', Object.keys(packageJson.dependencies).length);

// Remove problematic packages that cause ajv conflicts
const problematicPackages = [
  '@stardazed/streams-text-encoding',
  '@ungap/structured-clone',
  'nativewind'
];

problematicPackages.forEach(pkg => {
  if (packageJson.dependencies[pkg]) {
    console.log(`❌ Removing problematic package: ${pkg}`);
    delete packageJson.dependencies[pkg];
  }
});

// Add resolutions to force compatible versions
packageJson.resolutions = {
  "ajv": "^8.17.1",
  "ajv-keywords": "^5.1.0",
  "schema-utils": "^4.2.0"
};

// Add overrides for npm
packageJson.overrides = {
  "ajv": "^8.17.1",
  "ajv-keywords": "^5.1.0",
  "schema-utils": "^4.2.0"
};

console.log('📝 Writing updated package.json...');
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

console.log('🧹 Cleaning environment...');
try {
  execSync('rm -rf node_modules package-lock.json', { stdio: 'inherit' });
} catch (_error) {
  console.log('Note: Some cleanup files may not exist');
}

console.log('📦 Installing dependencies with resolutions...');
try {
  execSync('npm install --legacy-peer-deps --force', { stdio: 'inherit' });
  console.log('✅ Dependencies installed successfully');
} catch (error) {
  console.error('❌ Failed to install dependencies:', error.message);
  process.exit(1);
}

console.log('🚀 Running expo prebuild...');
try {
  execSync('npx expo prebuild --platform android --clean', { stdio: 'inherit' });
  
  // Check if android directory was created
  if (fs.existsSync(path.join(process.cwd(), 'android'))) {
    console.log('✅ Android directory created successfully!');
    
    // List android directory contents
    console.log('📁 Android directory contents:');
    execSync('ls -la android/', { stdio: 'inherit' });
    
    process.exit(0);
  } else {
    console.error('❌ Android directory was not created');
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Prebuild failed:', error.message);
  process.exit(1);
}