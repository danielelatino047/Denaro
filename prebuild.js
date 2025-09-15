const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

async function runPrebuild() {
  console.log('=== Starting Expo Prebuild ===');
  
  try {
    // Clean existing android directory
    if (fs.existsSync('android')) {
      console.log('Removing existing android directory...');
      fs.rmSync('android', { recursive: true, force: true });
    }
    
    console.log('Running expo prebuild...');
    
    // Run expo prebuild
    const prebuild = spawn('npx', ['expo', 'prebuild', '--platform', 'android', '--clean', '--no-install'], {
      stdio: 'inherit',
      shell: true
    });
    
    prebuild.on('close', (code) => {
      console.log(`\nPrebuild process exited with code ${code}`);
      
      if (code === 0) {
        // Check if android directory was created
        if (fs.existsSync('android')) {
          console.log('✅ Android directory created successfully!');
          
          // List contents
          console.log('\nAndroid directory contents:');
          const contents = fs.readdirSync('android');
          contents.forEach(item => {
            const itemPath = path.join('android', item);
            const stats = fs.statSync(itemPath);
            console.log(`${stats.isDirectory() ? 'd' : 'f'} ${item}`);
          });
          
          // Check essential files
          console.log('\nChecking essential files:');
          const essentialFiles = [
            'android/gradlew',
            'android/app/build.gradle', 
            'android/settings.gradle'
          ];
          
          essentialFiles.forEach(file => {
            if (fs.existsSync(file)) {
              console.log(`✅ ${path.basename(file)} found`);
            } else {
              console.log(`❌ ${path.basename(file)} missing`);
            }
          });
          
          console.log('\n=== Prebuild completed successfully! ===');
        } else {
          console.log('❌ Android directory was not created!');
        }
      } else {
        console.log('❌ Prebuild failed with exit code:', code);
      }
    });
    
    prebuild.on('error', (error) => {
      console.error('Error running prebuild:', error);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

runPrebuild();