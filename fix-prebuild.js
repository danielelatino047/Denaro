#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

console.log('=== Fixing Prebuild Dependencies ===');

try {
  // Remove problematic node_modules
  console.log('Cleaning node_modules...');
  if (fs.existsSync('node_modules')) {
    execSync('rm -rf node_modules', { stdio: 'inherit' });
  }
  
  if (fs.existsSync('package-lock.json')) {
    execSync('rm -f package-lock.json', { stdio: 'inherit' });
  }

  // Install with legacy peer deps to avoid conflicts
  console.log('Installing dependencies with legacy peer deps...');
  execSync('npm install --legacy-peer-deps --force', { stdio: 'inherit' });

  // Run prebuild with clean environment
  console.log('Running expo prebuild...');
  execSync('npx expo prebuild --clean --platform android', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_OPTIONS: '--max-old-space-size=4096'
    }
  });

  // Check if android directory was created
  if (fs.existsSync('android')) {
    console.log('✅ Android directory created successfully!');
    
    // List contents
    const contents = fs.readdirSync('.');
    console.log('Project contents:', contents.join(', '));
    
    process.exit(0);
  } else {
    console.error('❌ Android directory not created');
    process.exit(1);
  }

} catch (error) {
  console.error('Error during prebuild:', error.message);
  process.exit(1);
}