#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('=== Ultimate Prebuild Fix ===');

function runCommand(command, options = {}) {
  try {
    console.log(`Running: ${command}`);
    const result = execSync(command, { 
      stdio: 'inherit', 
      encoding: 'utf8',
      ...options 
    });
    return result;
  } catch (error) {
    console.error(`Command failed: ${command}`);
    console.error(`Error: ${error.message}`);
    throw error;
  }
}

function checkAndFixPackageJson() {
  console.log('Checking package.json...');
  
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    throw new Error('package.json not found!');
  }
  
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // Remove problematic packages that cause ajv conflicts
  const problematicPackages = [
    'nativewind',
    '@stardazed/streams-text-encoding',
    '@ungap/structured-clone'
  ];
  
  let modified = false;
  problematicPackages.forEach(pkg => {
    if (packageJson.dependencies && packageJson.dependencies[pkg]) {
      console.log(`Removing problematic package: ${pkg}`);
      delete packageJson.dependencies[pkg];
      modified = true;
    }
  });
  
  if (modified) {
    console.log('Writing updated package.json...');
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  }
}

function cleanEnvironment() {
  console.log('🧹 Cleaning environment...');
  
  // Remove problematic directories
  const dirsToRemove = ['node_modules', 'android', 'ios', '.expo'];
  dirsToRemove.forEach(dir => {
    if (fs.existsSync(dir)) {
      console.log(`Removing ${dir}...`);
      runCommand(`rm -rf ${dir}`);
    }
  });
  
  // Remove lock files
  const filesToRemove = ['package-lock.json', 'yarn.lock', 'bun.lockb'];
  filesToRemove.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`Removing ${file}...`);
      fs.unlinkSync(file);
    }
  });
}

function installDependencies() {
  console.log('📦 Installing dependencies...');
  
  // Create .npmrc to handle peer dependency conflicts
  fs.writeFileSync('.npmrc', `legacy-peer-deps=true
auto-install-peers=true
fund=false
audit=false`);
  
  // Clear npm cache
  runCommand('npm cache clean --force');
  
  // Install with legacy peer deps to avoid conflicts
  try {
    runCommand('npm install --legacy-peer-deps --force');
  } catch (error) {
    console.log('First install attempt failed, trying alternative...');
    runCommand('npm ci --legacy-peer-deps');
  }
}

function runPrebuild() {
  console.log('🚀 Running expo prebuild...');
  
  // Try different prebuild approaches
  const prebuildCommands = [
    'npx expo prebuild --clean --platform android --no-install',
    'npx expo prebuild --platform android --clear --no-install',
    'npx expo prebuild --clean --platform android',
    'npx expo prebuild --platform android'
  ];
  
  for (const command of prebuildCommands) {
    try {
      console.log(`Trying: ${command}`);
      runCommand(command, {
        env: {
          ...process.env,
          NODE_OPTIONS: '--max-old-space-size=8192',
          EXPO_NO_TELEMETRY: '1',
          CI: '1'
        }
      });
      
      // Check if android directory was created
      if (fs.existsSync('android')) {
        console.log('✅ Android directory created successfully!');
        return true;
      }
    } catch (error) {
      console.log(`Command failed: ${command}`);
      console.log('Trying next approach...');
    }
  }
  
  throw new Error('All prebuild attempts failed!');
}

function verifyAndroidProject() {
  console.log('Verifying Android project...');
  
  if (!fs.existsSync('android')) {
    throw new Error('Android directory not found!');
  }
  
  const requiredFiles = [
    'android/gradlew',
    'android/app/build.gradle',
    'android/build.gradle'
  ];
  
  requiredFiles.forEach(file => {
    if (!fs.existsSync(file)) {
      throw new Error(`Required file not found: ${file}`);
    }
  });
  
  // Make gradlew executable
  runCommand('chmod +x android/gradlew');
  
  console.log('✅ Android project verification successful!');
}

async function main() {
  try {
    checkAndFixPackageJson();
    cleanEnvironment();
    installDependencies();
    runPrebuild();
    verifyAndroidProject();
    
    console.log('🎉 Ultimate prebuild completed successfully!');
    
    // Show android directory structure
    console.log('Android directory structure:');
    runCommand('ls -la android/');
    
    // Clean up
    if (fs.existsSync('.npmrc')) {
      fs.unlinkSync('.npmrc');
    }
    
  } catch (error) {
    console.error('❌ Ultimate prebuild failed!');
    console.error(error.message);
    
    // Clean up on error
    if (fs.existsSync('.npmrc')) {
      fs.unlinkSync('.npmrc');
    }
    
    process.exit(1);
  }
}

main();