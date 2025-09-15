const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`Running: ${command} ${args.join(' ')}`);
    
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        resolve(code);
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });
    
    child.on('error', (error) => {
      reject(error);
    });
  });
}

async function main() {
  try {
    console.log('=== Starting Expo Prebuild Process ===');
    
    // Check expo CLI version
    console.log('\\nChecking Expo CLI...');
    await runCommand('npx', ['expo', '--version']);
    
    // Clean existing android directory
    if (fs.existsSync('android')) {
      console.log('\\nRemoving existing android directory...');
      fs.rmSync('android', { recursive: true, force: true });
    }
    
    // Run expo prebuild
    console.log('\\nRunning expo prebuild...');
    await runCommand('npx', ['expo', 'prebuild', '--platform', 'android', '--clean', '--no-install']);
    
    // Verify android directory was created
    console.log('\\nVerifying android directory...');
    if (fs.existsSync('android')) {
      console.log('✅ Android directory created successfully!');
      
      // Show directory structure
      console.log('\\nAndroid directory contents:');
      const contents = fs.readdirSync('android');
      contents.forEach(item => {
        const itemPath = path.join('android', item);
        const stats = fs.statSync(itemPath);
        console.log(`${stats.isDirectory() ? 'd' : 'f'} ${item}`);
      });
      
      // Check essential files
      console.log('\\nChecking essential files:');
      const essentialFiles = [
        'android/gradlew',
        'android/app/build.gradle',
        'android/settings.gradle',
        'android/app/src/main/AndroidManifest.xml'
      ];
      
      essentialFiles.forEach(file => {
        if (fs.existsSync(file)) {
          console.log(`✅ ${path.relative('android', file)} found`);
        } else {
          console.log(`❌ ${path.relative('android', file)} missing`);
        }
      });
      
      // Make gradlew executable
      if (fs.existsSync('android/gradlew')) {
        console.log('\\nMaking gradlew executable...');
        fs.chmodSync('android/gradlew', '755');
        console.log('✅ gradlew is now executable');
      }
      
      console.log('\\n=== Prebuild completed successfully! ===');
      console.log('\\nNext steps:');
      console.log('1. The android directory has been created');
      console.log('2. You can now build the APK using: cd android && ./gradlew assembleDebug');
      console.log('3. Or use EAS build for production builds');
      
    } else {
      console.log('❌ Android directory was not created!');
      console.log('\\nCurrent directory contents:');
      const contents = fs.readdirSync('.');
      contents.forEach(item => {
        const stats = fs.statSync(item);
        console.log(`${stats.isDirectory() ? 'd' : 'f'} ${item}`);
      });
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\\n❌ Error during prebuild:', error.message);
    process.exit(1);
  }
}

main();