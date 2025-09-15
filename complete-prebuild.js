const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('=== Expo Prebuild Diagnostic and Execution ===');

try {
  // 1. Check current environment
  console.log('\\n1. Checking environment...');
  console.log('Node version:', process.version);
  console.log('Current working directory:', process.cwd());
  
  // 2. Check if package.json exists and has correct dependencies
  console.log('\\n2. Checking package.json...');
  if (fs.existsSync('package.json')) {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    console.log('✅ package.json found');
    console.log('Project name:', pkg.name);
    console.log('Expo version:', pkg.dependencies?.expo || 'Not found');
    console.log('@expo/cli version:', pkg.dependencies?.['@expo/cli'] || 'Not found');
  } else {
    console.log('❌ package.json not found');
    process.exit(1);
  }
  
  // 3. Check if app.json exists and is valid
  console.log('\\n3. Checking app.json...');
  if (fs.existsSync('app.json')) {
    const appConfig = JSON.parse(fs.readFileSync('app.json', 'utf8'));
    console.log('✅ app.json found');
    console.log('App name:', appConfig.expo?.name || 'Not specified');
    console.log('App slug:', appConfig.expo?.slug || 'Not specified');
    console.log('Android package:', appConfig.expo?.android?.package || 'Not specified');
  } else {
    console.log('❌ app.json not found');
    process.exit(1);
  }
  
  // 4. Check expo CLI
  console.log('\\n4. Checking Expo CLI...');
  try {
    const expoVersion = execSync('npx expo --version', { encoding: 'utf8' });
    console.log('✅ Expo CLI version:', expoVersion.trim());
  } catch (error) {
    console.log('❌ Expo CLI not available:', error.message);
    process.exit(1);
  }
  
  // 5. Clean existing android directory
  console.log('\\n5. Cleaning existing android directory...');
  if (fs.existsSync('android')) {
    fs.rmSync('android', { recursive: true, force: true });
    console.log('✅ Existing android directory removed');
  } else {
    console.log('ℹ️ No existing android directory found');
  }
  
  // 6. Run expo prebuild
  console.log('\\n6. Running expo prebuild...');
  console.log('Command: npx expo prebuild --platform android --clean --no-install');
  
  try {
    execSync('npx expo prebuild --platform android --clean --no-install', {
      stdio: 'inherit',
      cwd: process.cwd()
    });
    console.log('✅ Expo prebuild completed');
  } catch (error) {
    console.log('❌ Expo prebuild failed:', error.message);
    
    // Try alternative approach
    console.log('\\n7. Trying alternative prebuild approach...');
    try {
      execSync('npx expo prebuild --platform android --clean', {
        stdio: 'inherit',
        cwd: process.cwd()
      });
      console.log('✅ Alternative prebuild completed');
    } catch (altError) {
      console.log('❌ Alternative prebuild also failed:', altError.message);
      process.exit(1);
    }
  }
  
  // 7. Verify android directory was created
  console.log('\\n8. Verifying android directory...');
  if (fs.existsSync('android')) {
    console.log('✅ Android directory created successfully!');
    
    // Check directory structure
    console.log('\\nAndroid directory contents:');
    const contents = fs.readdirSync('android');
    contents.forEach(item => {
      const itemPath = path.join('android', item);
      const stats = fs.statSync(itemPath);
      console.log(`  ${stats.isDirectory() ? 'd' : 'f'} ${item}`);
    });
    
    // Check essential files
    console.log('\\nChecking essential files:');
    const essentialFiles = [
      'android/gradlew',
      'android/app/build.gradle',
      'android/settings.gradle',
      'android/gradle.properties',
      'android/app/src/main/AndroidManifest.xml'
    ];
    
    let allFilesPresent = true;
    essentialFiles.forEach(file => {
      if (fs.existsSync(file)) {
        console.log(`  ✅ ${path.basename(file)} found`);
      } else {
        console.log(`  ❌ ${path.basename(file)} missing`);
        allFilesPresent = false;
      }
    });
    
    if (allFilesPresent) {
      console.log('\\n✅ All essential files are present!');
      
      // Make gradlew executable
      if (fs.existsSync('android/gradlew')) {
        fs.chmodSync('android/gradlew', '755');
        console.log('✅ gradlew made executable');
      }
      
      console.log('\\n=== SUCCESS: Android project is ready! ===');
      console.log('\\nNext steps:');
      console.log('1. You can now build a debug APK with: cd android && ./gradlew assembleDebug');
      console.log('2. The APK will be located at: android/app/build/outputs/apk/debug/app-debug.apk');
      console.log('3. Or use EAS build for production builds');
      
    } else {
      console.log('\\n❌ Some essential files are missing. The android project may not be complete.');
    }
    
  } else {
    console.log('❌ Android directory was not created!');
    console.log('\\nCurrent directory contents:');
    const contents = fs.readdirSync('.');
    contents.forEach(item => {
      const stats = fs.statSync(item);
      console.log(`  ${stats.isDirectory() ? 'd' : 'f'} ${item}`);
    });
    process.exit(1);
  }
  
} catch (error) {
  console.error('\\n❌ Fatal error:', error.message);
  process.exit(1);
}