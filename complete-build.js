#!/usr/bin/env node

/**
 * Complete Release Build Script for ArbitrageSwap AI
 * This script handles all dependency issues and creates a production build
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 ArbitrageSwap AI - Complete Release Build');
console.log('==========================================');

function runCommand(command, description) {
  console.log(`\n📋 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit', cwd: process.cwd() });
    console.log(`✅ ${description} completed successfully`);
    return true;
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    return false;
  }
}

function updatePackageJson() {
  console.log('\n🔧 Fixing package.json dependencies...');
  
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

  // Add resolutions to fix ajv issues
  packageJson.resolutions = {
    ...packageJson.resolutions,
    "ajv": "^8.17.1",
    "ajv-keywords": "^5.1.0",
    "schema-utils": "^4.2.0"
  };

  // Add overrides for npm
  packageJson.overrides = {
    ...packageJson.overrides,
    "ajv": "^8.17.1",
    "ajv-keywords": "^5.1.0", 
    "schema-utils": "^4.2.0"
  };

  // Update version for release
  const currentVersion = packageJson.version;
  const versionParts = currentVersion.split('.');
  versionParts[2] = (parseInt(versionParts[2]) + 1).toString();
  packageJson.version = versionParts.join('.');

  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log(`✅ Updated package.json (version: ${packageJson.version})`);
}

function cleanProject() {
  console.log('\n🧹 Cleaning project...');
  
  const itemsToClean = [
    'node_modules',
    'package-lock.json',
    'android',
    'ios',
    '.expo'
  ];

  itemsToClean.forEach(item => {
    try {
      execSync(`rm -rf ${item}`, { stdio: 'pipe' });
      console.log(`  ✓ Removed ${item}`);
    } catch (_error) {
      console.log(`  - ${item} not found (ok)`);
    }
  });
}

function installDependencies() {
  console.log('\n📦 Installing dependencies...');
  
  // Clear npm cache
  runCommand('npm cache clean --force', 'Clearing npm cache');
  
  // Install with legacy peer deps to avoid conflicts
  return runCommand('npm install --legacy-peer-deps --force', 'Installing dependencies');
}

function runPrebuild() {
  console.log('\n🔨 Running expo prebuild...');
  
  const prebuildCommands = [
    'npx expo prebuild --clean --platform android --no-install',
    'npx expo prebuild --platform android --no-install',
    'npx expo prebuild --clean --platform android'
  ];

  for (const command of prebuildCommands) {
    console.log(`\n  Trying: ${command}`);
    if (runCommand(command, 'Expo prebuild')) {
      return true;
    }
  }
  
  return false;
}

function buildRelease() {
  console.log('\n📱 Building release APK...');
  
  const androidDir = path.join(process.cwd(), 'android');
  if (!fs.existsSync(androidDir)) {
    console.error('❌ Android directory not found. Prebuild failed.');
    return false;
  }

  // Change to android directory
  process.chdir(androidDir);
  
  // Clean and build
  if (!runCommand('./gradlew clean', 'Cleaning Android project')) {
    return false;
  }
  
  if (!runCommand('./gradlew assembleRelease', 'Building release APK')) {
    return false;
  }

  // Check if APK was built
  const apkPath = path.join(androidDir, 'app', 'build', 'outputs', 'apk', 'release', 'app-release.apk');
  if (fs.existsSync(apkPath)) {
    // Copy APK to root directory
    const rootDir = path.dirname(androidDir);
    const targetPath = path.join(rootDir, 'arbitrageswap-ai-release.apk');
    fs.copyFileSync(apkPath, targetPath);
    
    console.log('✅ Release APK built successfully!');
    console.log(`📍 APK location: ${targetPath}`);
    return true;
  } else {
    console.error('❌ Release APK not found');
    return false;
  }
}

// Main execution
async function main() {
  try {
    // Step 1: Update package.json
    updatePackageJson();
    
    // Step 2: Clean project
    cleanProject();
    
    // Step 3: Install dependencies
    if (!installDependencies()) {
      throw new Error('Failed to install dependencies');
    }
    
    // Step 4: Run prebuild
    if (!runPrebuild()) {
      throw new Error('Failed to run expo prebuild');
    }
    
    // Step 5: Build release
    if (!buildRelease()) {
      throw new Error('Failed to build release APK');
    }
    
    console.log('\n🎉 SUCCESS! Release build completed successfully!');
    console.log('📱 Your production APK is ready: arbitrageswap-ai-release.apk');
    console.log('\n💡 Next steps:');
    console.log('  1. Test the APK on a physical device');
    console.log('  2. Upload to Google Play Console for distribution');
    
  } catch (error) {
    console.error('\n💥 Build failed:', error.message);
    console.log('\n🔍 Troubleshooting tips:');
    console.log('  1. Make sure you have Android SDK installed');
    console.log('  2. Check that ANDROID_HOME is set correctly');
    console.log('  3. Ensure Java 11+ is installed');
    console.log('  4. Try running: npx expo doctor');
    process.exit(1);
  }
}

// Run the build process
main();