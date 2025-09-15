const { execSync } = require('child_process');

try {
  console.log('Checking expo CLI...');
  const result = execSync('npx expo --version', { encoding: 'utf8' });
  console.log('Expo CLI version:', result.trim());
  
  console.log('\nRunning expo prebuild...');
  execSync('npx expo prebuild --platform android --clean --no-install', { 
    stdio: 'inherit' 
  });
  
  console.log('\nPrebuild completed!');
} catch (error) {
  console.error('Error:', error.message);
}