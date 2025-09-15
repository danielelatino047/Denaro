#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Starting comprehensive Android configuration fix...');

// Step 1: Clean environment
console.log('🧹 Cleaning environment...');
try {
  if (fs.existsSync('node_modules')) {
    execSync('rm -rf node_modules', { stdio: 'inherit' });
  }
  if (fs.existsSync('package-lock.json')) {
    execSync('rm -f package-lock.json', { stdio: 'inherit' });
  }
  if (fs.existsSync('bun.lock')) {
    execSync('rm -f bun.lock', { stdio: 'inherit' });
  }
} catch (error) {
  console.log('⚠️ Clean step had issues, continuing...');
}

// Step 2: Install dependencies
console.log('📦 Installing dependencies...');
try {
  execSync('npm install --legacy-peer-deps --force', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Failed to install dependencies:', error.message);
  process.exit(1);
}

// Step 3: Run prebuild
console.log('🚀 Running expo prebuild...');
try {
  execSync('npx expo prebuild --platform android --clean', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Prebuild failed:', error.message);
  
  // Try alternative prebuild approaches
  console.log('🔄 Trying alternative prebuild...');
  try {
    execSync('npx expo prebuild --platform android', { stdio: 'inherit' });
  } catch (error2) {
    console.error('❌ Alternative prebuild also failed:', error2.message);
    process.exit(1);
  }
}

// Step 4: Fix Android configurations
console.log('🔧 Fixing Android configurations...');

const androidDir = path.join(process.cwd(), 'android');
if (!fs.existsSync(androidDir)) {
  console.error('❌ Android directory not found after prebuild!');
  process.exit(1);
}

// Fix AndroidManifest.xml
const manifestPath = path.join(androidDir, 'app', 'src', 'main', 'AndroidManifest.xml');
if (fs.existsSync(manifestPath)) {
  console.log('📝 Fixing AndroidManifest.xml...');
  let manifest = fs.readFileSync(manifestPath, 'utf8');
  
  // Ensure MainActivity has android:exported="true"
  if (manifest.includes('android:name=".MainActivity"')) {
    // Check if exported is already set
    if (!manifest.includes('android:exported="true"')) {
      manifest = manifest.replace(
        /<activity\s+android:name="\.MainActivity"/g,
        '<activity android:name=".MainActivity"\n        android:exported="true"'
      );
    }
    
    // Ensure proper launch mode and config changes
    if (!manifest.includes('android:launchMode="singleTask"')) {
      manifest = manifest.replace(
        /android:name="\.MainActivity"[^>]*>/g,
        (match) => {
          if (!match.includes('android:launchMode')) {
            return match.replace('>', '\n        android:launchMode="singleTask">');
          }
          return match;
        }
      );
    }
    
    // Add configChanges if not present
    if (!manifest.includes('android:configChanges')) {
      manifest = manifest.replace(
        /android:name="\.MainActivity"[^>]*>/g,
        (match) => {
          if (!match.includes('android:configChanges')) {
            return match.replace('>', '\n        android:configChanges="keyboard|keyboardHidden|orientation|screenSize|uiMode">');
          }
          return match;
        }
      );
    }
    
    // Add windowSoftInputMode if not present
    if (!manifest.includes('android:windowSoftInputMode')) {
      manifest = manifest.replace(
        /android:name="\.MainActivity"[^>]*>/g,
        (match) => {
          if (!match.includes('android:windowSoftInputMode')) {
            return match.replace('>', '\n        android:windowSoftInputMode="adjustResize">');
          }
          return match;
        }
      );
    }
    
    fs.writeFileSync(manifestPath, manifest);
    console.log('✅ AndroidManifest.xml updated');
  }
} else {
  console.log('⚠️ AndroidManifest.xml not found, skipping...');
}

// Fix build.gradle
const buildGradlePath = path.join(androidDir, 'app', 'build.gradle');
if (fs.existsSync(buildGradlePath)) {
  console.log('📝 Fixing build.gradle...');
  let buildGradle = fs.readFileSync(buildGradlePath, 'utf8');
  
  // Ensure proper React configuration
  const reactConfig = `project.ext.react = [
    enableHermes: true,
    bundleInDebug: true,
    bundleInRelease: true
]`;

  if (!buildGradle.includes('project.ext.react')) {
    // Add React configuration at the top
    buildGradle = reactConfig + '\n\n' + buildGradle;
  } else {
    // Update existing configuration
    buildGradle = buildGradle.replace(
      /project\.ext\.react\s*=\s*\[[^\]]*\]/g,
      reactConfig
    );
  }
  
  // Ensure minimum SDK version
  if (buildGradle.includes('minSdkVersion')) {
    buildGradle = buildGradle.replace(/minSdkVersion\s+\d+/g, 'minSdkVersion 23');
  }
  
  // Ensure target SDK version
  if (buildGradle.includes('targetSdkVersion')) {
    buildGradle = buildGradle.replace(/targetSdkVersion\s+\d+/g, 'targetSdkVersion 34');
  }
  
  fs.writeFileSync(buildGradlePath, buildGradle);
  console.log('✅ build.gradle updated');
} else {
  console.log('⚠️ build.gradle not found, skipping...');
}

// Fix MainApplication.java if needed
const mainAppPath = path.join(androidDir, 'app', 'src', 'main', 'java', 'com', 'arbitrageswap', 'ai', 'MainApplication.java');
if (fs.existsSync(mainAppPath)) {
  console.log('📝 Checking MainApplication.java...');
  let mainApp = fs.readFileSync(mainAppPath, 'utf8');
  
  // Ensure proper imports and configuration
  if (!mainApp.includes('import expo.modules.ApplicationLifecycleDispatcher;')) {
    mainApp = mainApp.replace(
      /import com\.facebook\.react\.ReactApplication;/,
      'import com.facebook.react.ReactApplication;\nimport expo.modules.ApplicationLifecycleDispatcher;'
    );
  }
  
  fs.writeFileSync(mainAppPath, mainApp);
  console.log('✅ MainApplication.java checked');
} else {
  console.log('⚠️ MainApplication.java not found, skipping...');
}

console.log('🎉 Android configuration fix completed!');
console.log('📁 Android directory created and configured');
console.log('🔧 Next steps:');
console.log('   1. Commit the android/ directory to your repo');
console.log('   2. Build the APK with: cd android && ./gradlew assembleDebug');