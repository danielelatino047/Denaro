#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Starting comprehensive Android fix for immediate crash prevention...');

// Step 1: Clean and install
console.log('🧹 Cleaning and installing dependencies...');
try {
  // Clean old files
  ['node_modules', 'package-lock.json', 'bun.lock', 'android'].forEach(item => {
    if (fs.existsSync(item)) {
      console.log(`Removing ${item}...`);
      execSync(`rm -rf ${item}`, { stdio: 'inherit' });
    }
  });

  // Install with legacy peer deps to avoid conflicts
  console.log('📦 Installing dependencies...');
  execSync('npm install --legacy-peer-deps --force', { stdio: 'inherit' });
  
} catch (error) {
  console.error('❌ Installation failed:', error.message);
  process.exit(1);
}

// Step 2: Run prebuild with multiple fallback strategies
console.log('🚀 Running expo prebuild...');
const prebuildCommands = [
  'npx expo prebuild --platform android --clean',
  'npx expo prebuild --platform android',
  'npx expo prebuild --clean --platform android --no-install'
];

let prebuildSuccess = false;
for (const command of prebuildCommands) {
  try {
    console.log(`Trying: ${command}`);
    execSync(command, { stdio: 'inherit' });
    prebuildSuccess = true;
    break;
  } catch (error) {
    console.log(`❌ Command failed: ${command}`);
    console.log('Trying next approach...');
  }
}

if (!prebuildSuccess) {
  console.error('❌ All prebuild attempts failed!');
  process.exit(1);
}

// Step 3: Verify android directory exists
const androidDir = path.join(process.cwd(), 'android');
if (!fs.existsSync(androidDir)) {
  console.error('❌ Android directory not created after prebuild!');
  process.exit(1);
}

console.log('✅ Android directory created successfully');

// Step 4: Fix AndroidManifest.xml
console.log('🔧 Fixing AndroidManifest.xml...');
const manifestPath = path.join(androidDir, 'app', 'src', 'main', 'AndroidManifest.xml');
if (fs.existsSync(manifestPath)) {
  let manifest = fs.readFileSync(manifestPath, 'utf8');
  
  // Fix MainActivity configuration
  const mainActivityRegex = /<activity[^>]*android:name="\.MainActivity"[^>]*>/g;
  const mainActivityMatch = manifest.match(mainActivityRegex);
  
  if (mainActivityMatch) {
    const originalActivity = mainActivityMatch[0];
    
    // Create the fixed activity tag
    let fixedActivity = '<activity android:name=".MainActivity"';
    
    // Add required attributes
    if (!originalActivity.includes('android:exported=')) {
      fixedActivity += '\n        android:exported="true"';
    }
    if (!originalActivity.includes('android:launchMode=')) {
      fixedActivity += '\n        android:launchMode="singleTask"';
    }
    if (!originalActivity.includes('android:configChanges=')) {
      fixedActivity += '\n        android:configChanges="keyboard|keyboardHidden|orientation|screenSize|uiMode"';
    }
    if (!originalActivity.includes('android:windowSoftInputMode=')) {
      fixedActivity += '\n        android:windowSoftInputMode="adjustResize"';
    }
    
    fixedActivity += '>';
    
    // Replace the original activity tag
    manifest = manifest.replace(mainActivityRegex, fixedActivity);
    
    // Ensure usesCleartextTraffic is enabled for HTTP requests
    if (!manifest.includes('android:usesCleartextTraffic="true"')) {
      manifest = manifest.replace(
        /<application[^>]*>/,
        (match) => {
          if (!match.includes('android:usesCleartextTraffic')) {
            return match.replace('>', '\n        android:usesCleartextTraffic="true">');
          }
          return match;
        }
      );
    }
    
    fs.writeFileSync(manifestPath, manifest);
    console.log('✅ AndroidManifest.xml fixed');
  }
} else {
  console.log('⚠️ AndroidManifest.xml not found');
}

// Step 5: Fix build.gradle
console.log('🔧 Fixing build.gradle...');
const buildGradlePath = path.join(androidDir, 'app', 'build.gradle');
if (fs.existsSync(buildGradlePath)) {
  let buildGradle = fs.readFileSync(buildGradlePath, 'utf8');
  
  // Add React configuration at the top if not present
  const reactConfig = `project.ext.react = [
    enableHermes: true,
    bundleInDebug: true,
    bundleInRelease: true
]

`;

  if (!buildGradle.includes('project.ext.react')) {
    buildGradle = reactConfig + buildGradle;
  } else {
    // Update existing configuration
    buildGradle = buildGradle.replace(
      /project\.ext\.react\s*=\s*\[[^\]]*\]/s,
      `project.ext.react = [
    enableHermes: true,
    bundleInDebug: true,
    bundleInRelease: true
]`
    );
  }
  
  // Ensure proper SDK versions
  buildGradle = buildGradle.replace(/minSdkVersion\s+\d+/g, 'minSdkVersion 23');
  buildGradle = buildGradle.replace(/targetSdkVersion\s+\d+/g, 'targetSdkVersion 34');
  buildGradle = buildGradle.replace(/compileSdkVersion\s+\d+/g, 'compileSdkVersion 34');
  
  fs.writeFileSync(buildGradlePath, buildGradle);
  console.log('✅ build.gradle fixed');
} else {
  console.log('⚠️ build.gradle not found');
}

// Step 6: Fix gradle.properties
console.log('🔧 Fixing gradle.properties...');
const gradlePropsPath = path.join(androidDir, 'gradle.properties');
if (fs.existsSync(gradlePropsPath)) {
  let gradleProps = fs.readFileSync(gradlePropsPath, 'utf8');
  
  // Ensure Hermes is enabled
  if (!gradleProps.includes('hermesEnabled=true')) {
    if (gradleProps.includes('hermesEnabled=false')) {
      gradleProps = gradleProps.replace('hermesEnabled=false', 'hermesEnabled=true');
    } else {
      gradleProps += '\nhermesEnabled=true\n';
    }
  }
  
  // Add other important properties
  const requiredProps = [
    'android.useAndroidX=true',
    'android.enableJetifier=true',
    'org.gradle.jvmargs=-Xmx2048m -XX:MaxPermSize=512m -XX:+HeapDumpOnOutOfMemoryError -Dfile.encoding=UTF-8'
  ];
  
  requiredProps.forEach(prop => {
    const [key] = prop.split('=');
    if (!gradleProps.includes(key)) {
      gradleProps += `\n${prop}\n`;
    }
  });
  
  fs.writeFileSync(gradlePropsPath, gradleProps);
  console.log('✅ gradle.properties fixed');
} else {
  console.log('⚠️ gradle.properties not found');
}

// Step 7: Create a simple build script
console.log('📝 Creating build script...');
const buildScript = `#!/bin/bash
set -e

echo "🏗️ Building Android Debug APK..."

cd android

# Clean previous builds
echo "🧹 Cleaning previous builds..."
./gradlew clean

# Build debug APK
echo "📦 Building debug APK..."
./gradlew assembleDebug

# Find and copy APK
echo "📁 Locating APK..."
APK_PATH=$(find app/build/outputs/apk/debug -name "*.apk" | head -1)

if [ -f "$APK_PATH" ]; then
    echo "✅ APK built successfully: $APK_PATH"
    echo "📱 Install with: adb install $APK_PATH"
else
    echo "❌ APK not found!"
    exit 1
fi
`;

fs.writeFileSync('build-debug-apk.sh', buildScript);
execSync('chmod +x build-debug-apk.sh');
console.log('✅ Build script created: build-debug-apk.sh');

// Step 8: Verify package consistency
console.log('🔍 Verifying package consistency...');
const appJson = JSON.parse(fs.readFileSync('app.json', 'utf8'));
const androidPackage = appJson.expo.android.package;

// Check if package name matches in all files
const mainAppJavaPath = path.join(androidDir, 'app', 'src', 'main', 'java');
const packagePath = androidPackage.replace(/\./g, '/');
const expectedJavaPath = path.join(mainAppJavaPath, packagePath);

if (fs.existsSync(expectedJavaPath)) {
  console.log('✅ Package structure is consistent');
} else {
  console.log('⚠️ Package structure might be inconsistent');
}

console.log('🎉 Android configuration fix completed!');
console.log('');
console.log('📋 Summary of fixes applied:');
console.log('   ✅ AndroidManifest.xml - Added android:exported="true" and proper configuration');
console.log('   ✅ build.gradle - Enabled Hermes and bundle embedding for offline APK');
console.log('   ✅ gradle.properties - Optimized build settings');
console.log('   ✅ Build script created for easy APK generation');
console.log('');
console.log('🚀 Next steps:');
console.log('   1. Run: ./build-debug-apk.sh');
console.log('   2. Install APK on device: adb install android/app/build/outputs/apk/debug/app-debug.apk');
console.log('   3. The app should now start without immediate crashes');
console.log('');
console.log('🔧 If the app still crashes, check:');
console.log('   - Device logs: adb logcat | grep -i "arbitrageswap"');
console.log('   - JavaScript errors in the ErrorBoundary UI');
console.log('   - Network connectivity for API calls');