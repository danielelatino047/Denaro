const { execSync } = require('child_process');
const fs = require('fs');

console.log('=== Testing Expo Prebuild ===');

try {
  // Check expo version
  console.log('Checking Expo CLI version...');
  const version = execSync('npx expo --version', { encoding: 'utf8' });
  console.log('Expo CLI version:', version.trim());
  
  // Check current directory
  console.log('\nCurrent directory contents:');
  const files = fs.readdirSync('.');
  files.forEach(file => {
    const stats = fs.statSync(file);
    console.log(`${stats.isDirectory() ? 'd' : 'f'} ${file}`);
  });
  
  // Remove existing android directory if it exists
  if (fs.existsSync('android')) {
    console.log('\nRemoving existing android directory...');
    fs.rmSync('android', { recursive: true, force: true });
  }
  
  // Try to run prebuild
  console.log('\nRunning expo prebuild...');
  execSync('npx expo prebuild --platform android --clean --no-install', {
    stdio: 'inherit',
    cwd: process.cwd()
  });
  
  // Check if android directory was created
  if (fs.existsSync('android')) {
    console.log('\n✅ SUCCESS: Android directory created!');
    
    // Show android directory structure
    console.log('\nAndroid directory structure:');
    const androidFiles = fs.readdirSync('android');
    androidFiles.forEach(file => {
      const filePath = `android/${file}`;
      const stats = fs.statSync(filePath);
      console.log(`${stats.isDirectory() ? 'd' : 'f'} ${file}`);
    });
    
    // Check for key files
    const keyFiles = ['gradlew', 'settings.gradle', 'app/build.gradle'];
    console.log('\nChecking key files:');
    keyFiles.forEach(file => {
      const fullPath = `android/${file}`;
      if (fs.existsSync(fullPath)) {
        console.log(`✅ ${file} exists`);
      } else {
        console.log(`❌ ${file} missing`);
      }
    });
    
  } else {
    console.log('\n❌ FAILED: Android directory was not created');
  }
  
} catch (error) {
  console.error('\n❌ ERROR:', error.message);
  
  // Show more details about the error
  if (error.stdout) {
    console.log('\nSTDOUT:', error.stdout.toString());
  }
  if (error.stderr) {
    console.log('\nSTDERR:', error.stderr.toString());
  }
}