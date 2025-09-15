#!/usr/bin/env node

// Simple startup script to bypass Metro version issues
const { spawn } = require('child_process');

console.log('🚀 Starting Expo app with compatibility fixes...');

// Set environment variables to fix Metro issues
process.env.EXPO_USE_FAST_RESOLVER = 'true';
process.env.EXPO_NO_DOTENV = 'true';

// Start expo with npx to avoid bun issues
const expo = spawn('npx', ['expo', 'start', '--web', '--tunnel'], {
  stdio: 'inherit',
  cwd: process.cwd(),
  env: {
    ...process.env,
    NODE_ENV: 'development'
  }
});

expo.on('close', (code) => {
  console.log(`Expo process exited with code ${code}`);
  process.exit(code);
});

expo.on('error', (err) => {
  console.error('Failed to start Expo:', err);
  process.exit(1);
});