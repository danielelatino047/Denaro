const fs = require('fs');
const path = require('path');
const __dirname = process.cwd();

console.log('🔧 Fixing SDK 53 Metro TerminalReporter issue...');

// Read package.json
const packageJsonPath = path.join(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

console.log('📦 Current Expo version:', packageJson.dependencies.expo);

// Fix scripts to use npx instead of bun
packageJson.scripts = {
  ...packageJson.scripts,
  "start": "npx expo start --tunnel",
  "start-web": "npx expo start --web --tunnel", 
  "start-web-dev": "DEBUG=expo* npx expo start --web --tunnel",
  "android": "npx expo start --android",
  "ios": "npx expo start --ios",
  "web": "npx expo start --web"
};

// Add Metro override for SDK 53
packageJson.overrides = {
  "metro": "0.76.7",
  "@expo/metro-config": "^53.0.0"
};

// Ensure Metro is in devDependencies
packageJson.devDependencies = {
  ...packageJson.devDependencies,
  "metro": "0.76.7"
};

// Write back package.json
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

console.log('✅ package.json updated with SDK 53 fixes');
console.log('🚀 Run: npm install && npx expo start --web --tunnel');