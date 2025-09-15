#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

console.log('=== Ultimate Prebuild Fix ===');

try {
  // Step 1: Clean everything
  console.log('🧹 Cleaning project...');
  
  if (fs.existsSync('android')) {
    execSync('rm -rf android', { stdio: 'inherit' });
  }
  
  if (fs.existsSync('ios')) {
    execSync('rm -rf ios', { stdio: 'inherit' });
  }
  
  if (fs.existsSync('node_modules')) {
    execSync('rm -rf node_modules', { stdio: 'inherit' });
  }
  
  if (fs.existsSync('package-lock.json')) {
    execSync('rm -f package-lock.json', { stdio: 'inherit' });
  }

  // Step 2: Install with specific npm configuration
  console.log('📦 Installing dependencies...');
  
  // Create .npmrc to handle peer dependency conflicts
  fs.writeFileSync('.npmrc', `legacy-peer-deps=true
auto-install-peers=true
fund=false
audit=false`);

  execSync('npm install --force', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_OPTIONS: '--max-old-space-size=8192'
    }
  });

  // Step 3: Fix ajv issue by installing compatible versions
  console.log('🔧 Fixing ajv compatibility...');
  
  try {
    execSync('npm install ajv@8.12.0 ajv-keywords@5.1.0 --save-dev --force', { 
      stdio: 'inherit' 
    });
  } catch (_e) {
    console.log('ajv install failed, continuing...');
  }

  // Step 4: Run prebuild with maximum compatibility
  console.log('🚀 Running expo prebuild...');
  
  const prebuildCommand = 'npx expo prebuild --clean --platform android --no-install';
  
  execSync(prebuildCommand, { 
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_OPTIONS: '--max-old-space-size=8192',
      EXPO_NO_TELEMETRY: '1',
      CI: '1'
    }
  });

  // Step 5: Verify success
  if (fs.existsSync('android')) {
    console.log('✅ SUCCESS! Android directory created!');
    
    // Show android directory structure
    try {
      const androidContents = fs.readdirSync('android');
      console.log('📁 Android directory contents:', androidContents.join(', '));
    } catch (_e) {
      console.log('Android directory exists but cannot read contents');
    }
    
    // Clean up
    if (fs.existsSync('.npmrc')) {
      fs.unlinkSync('.npmrc');
    }
    
    console.log('🎉 Prebuild completed successfully!');
    process.exit(0);
  } else {
    console.error('❌ FAILED: Android directory not created');
    process.exit(1);
  }

} catch (error) {
  console.error('💥 Prebuild failed:', error.message);
  
  // Clean up on error
  if (fs.existsSync('.npmrc')) {
    fs.unlinkSync('.npmrc');
  }
  
  console.error('Full error:', error);
  process.exit(1);
}