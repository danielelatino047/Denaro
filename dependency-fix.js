const { execSync } = require('child_process');
const fs = require('fs');

console.log('=== DEPENDENCY CONFLICT RESOLVER ===');

try {
  // Step 1: Clean everything
  console.log('🧹 Cleaning environment...');
  
  if (fs.existsSync('node_modules')) {
    execSync('rm -rf node_modules', { stdio: 'inherit' });
  }
  
  if (fs.existsSync('package-lock.json')) {
    fs.unlinkSync('package-lock.json');
  }
  
  if (fs.existsSync('bun.lock')) {
    fs.unlinkSync('bun.lock');
  }

  // Step 2: Clear npm cache
  console.log('📦 Clearing npm cache...');
  execSync('npm cache clean --force', { stdio: 'inherit' });

  // Step 3: Install dependencies with specific resolution
  console.log('📦 Installing dependencies...');
  execSync('npm install --legacy-peer-deps --no-package-lock', { stdio: 'inherit' });

  // Step 4: Force install compatible versions
  console.log('📦 Installing compatible ajv versions...');
  execSync('npm install ajv@8.12.0 ajv-keywords@5.1.0 schema-utils@4.2.0 --save-dev --legacy-peer-deps', { stdio: 'inherit' });

  // Step 5: Run prebuild
  console.log('🚀 Running expo prebuild...');
  execSync('npx expo prebuild --clean --platform android --no-install', { stdio: 'inherit' });

  // Step 6: Check result
  if (fs.existsSync('android')) {
    console.log('✅ SUCCESS: Android directory created!');
    console.log('Android directory contents:');
    execSync('ls -la android/', { stdio: 'inherit' });
  } else {
    console.log('❌ FAILED: Android directory not created');
    console.log('Current directory contents:');
    execSync('ls -la', { stdio: 'inherit' });
    process.exit(1);
  }

} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}