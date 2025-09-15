const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('=== Running Expo Prebuild ===');

try {
  // Clean any existing android directory
  if (fs.existsSync('android')) {
    console.log('Removing existing android directory...');
    fs.rmSync('android', { recursive: true, force: true });
  }

  // Run expo prebuild
  console.log('Running expo prebuild...');
  execSync('npx expo prebuild --platform android --clean --no-install', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });

  // Check if android directory was created
  if (fs.existsSync('android')) {
    console.log('✅ Android directory created successfully!');
    console.log('Android directory structure:');
    
    const androidContents = fs.readdirSync('android');
    androidContents.forEach(item => {
      const itemPath = path.join('android', item);
      const stats = fs.statSync(itemPath);
      console.log(`${stats.isDirectory() ? 'd' : '-'} ${item}`);
    });
    
    // Check for essential files
    const essentialFiles = [
      'android/gradlew',
      'android/app/build.gradle',
      'android/settings.gradle'
    ];
    
    essentialFiles.forEach(file => {
      if (fs.existsSync(file)) {
        console.log(`✅ ${path.basename(file)} found`);
      } else {
        console.log(`❌ ${path.basename(file)} not found`);
      }
    });
    
    console.log('=== Prebuild completed successfully ===');
  } else {
    console.log('❌ Android directory was not created!');
    process.exit(1);
  }
} catch (error) {
  console.error('Error during prebuild:', error.message);
  process.exit(1);
}