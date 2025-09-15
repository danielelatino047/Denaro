#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('=== Dependency Resolution Fix ===');

function runCommand(command, options = {}) {
  console.log(`Running: ${command}`);
  try {
    const result = execSync(command, { 
      stdio: 'inherit', 
      encoding: 'utf8',
      ...options 
    });
    return result;
  } catch (error) {
    console.error(`Command failed: ${command}`);
    console.error(`Error: ${error.message}`);
    throw error;
  }
}

function createMinimalPackageJson() {
  console.log('Creating minimal package.json for prebuild...');
  
  const minimalPackage = {
    "name": "arbitrageswap-ai",
    "main": "expo-router/entry",
    "version": "1.0.0",
    "scripts": {
      "start": "expo start",
      "android": "expo start --android",
      "ios": "expo start --ios",
      "web": "expo start --web"
    },
    "dependencies": {
      "expo": "~53.0.0",
      "expo-router": "~5.0.3",
      "expo-status-bar": "~2.2.3",
      "expo-constants": "~17.1.4",
      "expo-linking": "~7.1.4",
      "expo-splash-screen": "~0.30.7",
      "react": "18.3.1",
      "react-native": "0.76.3",
      "react-native-safe-area-context": "5.3.0",
      "react-native-screens": "~4.10.0",
      "react-native-gesture-handler": "~2.24.0"
    },
    "devDependencies": {
      "@babel/core": "^7.25.2",
      "@expo/cli": "^0.22.0",
      "typescript": "~5.8.3"
    },
    "private": true,
    "engines": {
      "node": ">=18.0.0"
    }
  };
  
  // Backup original package.json
  if (fs.existsSync('package.json')) {
    fs.copyFileSync('package.json', 'package.json.backup');
    console.log('Backed up original package.json');
  }
  
  fs.writeFileSync('package.json', JSON.stringify(minimalPackage, null, 2));
  console.log('Created minimal package.json');
}

function restorePackageJson() {
  console.log('Restoring original package.json...');
  if (fs.existsSync('package.json.backup')) {
    fs.copyFileSync('package.json.backup', 'package.json');
    fs.unlinkSync('package.json.backup');
    console.log('Restored original package.json');
  }
}

function cleanEnvironment() {
  console.log('🧹 Cleaning environment...');
  
  // Remove problematic directories
  const dirsToRemove = ['node_modules', 'android', 'ios', '.expo'];
  dirsToRemove.forEach(dir => {
    if (fs.existsSync(dir)) {
      console.log(`Removing ${dir}...`);
      runCommand(`rm -rf ${dir}`);
    }
  });
  
  // Remove lock files
  const lockFiles = ['package-lock.json', 'yarn.lock', 'bun.lock'];
  lockFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`Removing ${file}...`);
      fs.unlinkSync(file);
    }
  });
}

function installMinimalDependencies() {
  console.log('📦 Installing minimal dependencies...');
  
  // Clear npm cache
  runCommand('npm cache clean --force');
  
  // Install with legacy peer deps to avoid conflicts
  runCommand('npm install --legacy-peer-deps --no-audit --no-fund');
}

function runPrebuild() {
  console.log('🚀 Running expo prebuild...');
  
  const prebuildCommands = [
    'npx expo prebuild --platform android --clean --no-install',
    'npx expo prebuild --platform android --clear --no-install',
    'npx expo prebuild --platform android --clean',
    'npx expo prebuild --platform android'
  ];
  
  for (const command of prebuildCommands) {
    try {
      console.log(`Trying: ${command}`);
      runCommand(command);
      
      // Check if android directory was created
      if (fs.existsSync('android')) {
        console.log('✅ Prebuild successful!');
        return true;
      }
    } catch (error) {
      console.log(`Command failed: ${command}`);
      console.log(`Error: ${error.message}`);
      console.log('Trying next approach...');
    }
  }
  
  return false;
}

function verifyAndroidProject() {
  console.log('🔍 Verifying Android project...');
  
  if (!fs.existsSync('android')) {
    throw new Error('Android directory not created!');
  }
  
  const requiredFiles = [
    'android/gradlew',
    'android/build.gradle',
    'android/app/build.gradle',
    'android/app/src/main/AndroidManifest.xml'
  ];
  
  for (const file of requiredFiles) {
    if (!fs.existsSync(file)) {
      console.warn(`Warning: Required file missing: ${file}`);
    } else {
      console.log(`✓ Found: ${file}`);
    }
  }
  
  // Make gradlew executable
  if (fs.existsSync('android/gradlew')) {
    runCommand('chmod +x android/gradlew');
  }
  
  console.log('Android project verification completed');
}

function fixAndroidConfiguration() {
  console.log('🔧 Fixing Android configuration...');
  
  // Fix AndroidManifest.xml for Android 12+ compatibility
  const manifestPath = 'android/app/src/main/AndroidManifest.xml';
  if (fs.existsSync(manifestPath)) {
    let manifest = fs.readFileSync(manifestPath, 'utf8');
    
    // Ensure MainActivity has android:exported="true"
    if (manifest.includes('android:name=".MainActivity"') && !manifest.includes('android:exported="true"')) {
      manifest = manifest.replace(
        /<activity\s+android:name="\.MainActivity"/g,
        '<activity android:name=".MainActivity" android:exported="true"'
      );
      fs.writeFileSync(manifestPath, manifest);
      console.log('✓ Fixed AndroidManifest.xml for Android 12+ compatibility');
    }
  }
  
  // Fix app/build.gradle for offline debug builds
  const buildGradlePath = 'android/app/build.gradle';
  if (fs.existsSync(buildGradlePath)) {
    let buildGradle = fs.readFileSync(buildGradlePath, 'utf8');
    
    // Ensure bundleInDebug is true for offline APK
    if (!buildGradle.includes('bundleInDebug: true')) {
      const reactConfig = `
project.ext.react = [
    enableHermes: true,
    bundleInDebug: true,
    bundleInRelease: true
]
`;
      
      // Add or replace react config
      if (buildGradle.includes('project.ext.react')) {
        buildGradle = buildGradle.replace(
          /project\.ext\.react\s*=\s*\[[^\]]*\]/s,
          reactConfig.trim()
        );
      } else {
        // Add at the beginning of the file
        buildGradle = reactConfig + buildGradle;
      }
      
      fs.writeFileSync(buildGradlePath, buildGradle);
      console.log('✓ Fixed app/build.gradle for offline debug builds');
    }
  }
}

async function main() {
  try {
    console.log('Starting dependency resolution fix...');
    
    // Step 1: Clean environment
    cleanEnvironment();
    
    // Step 2: Create minimal package.json
    createMinimalPackageJson();
    
    // Step 3: Install minimal dependencies
    installMinimalDependencies();
    
    // Step 4: Run prebuild
    const prebuildSuccess = runPrebuild();
    
    if (!prebuildSuccess) {
      throw new Error('All prebuild attempts failed!');
    }
    
    // Step 5: Verify Android project
    verifyAndroidProject();
    
    // Step 6: Fix Android configuration
    fixAndroidConfiguration();
    
    // Step 7: Restore original package.json
    restorePackageJson();
    
    // Step 8: Reinstall full dependencies
    console.log('📦 Reinstalling full dependencies...');
    runCommand('npm install --legacy-peer-deps --no-audit --no-fund');
    
    console.log('✅ Dependency resolution fix completed successfully!');
    console.log('Android project is ready for building.');
    
  } catch (error) {
    console.error('❌ Dependency resolution fix failed!');
    console.error(`Error: ${error.message}`);
    
    // Try to restore package.json on error
    try {
      restorePackageJson();
    } catch (restoreError) {
      console.error('Failed to restore package.json:', restoreError.message);
    }
    
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };