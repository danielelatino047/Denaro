# EXPO SDK 53 RECOVERY PLAN

## Problem Analysis
The project has mixed SDK versions causing the Metro TerminalReporter error:
- Expo SDK: 53.0.4 ✅
- @expo packages: 54.x ❌ (causing conflicts)
- Metro: Not pinned to 0.76.7 ❌
- Bun usage: Incompatible with Expo ❌

## Solution Steps

### 1. Run the Recovery Script
Execute the comprehensive fix:
```bash
node ultimate-sdk53-fix.js
```

This script will:
- ✅ Downgrade all @expo/* packages from 54.x to 53.x
- ✅ Pin Metro to version 0.76.7 (SDK 53 compatible)
- ✅ Replace Bun commands with npx expo commands
- ✅ Add npm overrides to force correct versions
- ✅ Clean install with npm (not Bun)
- ✅ Run expo install --fix and expo doctor
- ✅ Create proper Metro config for SDK 53

### 2. Verify the Fix
After running the script, check:
```bash
# Check Metro version (should be 0.76.7)
npm ls metro

# Start the app (should work without TerminalReporter error)
npx expo start --web --tunnel

# Check for any remaining issues
npx expo doctor
```

### 3. Acceptance Criteria
✅ `npm ls metro` shows `metro@0.76.7`
✅ `npx expo start --web --tunnel` starts without `ERR_PACKAGE_PATH_NOT_EXPORTED`
✅ Web preview loads without crashes
✅ No critical errors in `npx expo doctor`

## Key Changes Made

### package.json Updates
- Scripts now use `npx expo` instead of `bunx rork`
- All @expo packages downgraded to SDK 53 versions
- Added Metro 0.76.7 and AJV packages for stability
- Added npm overrides to force correct versions

### Metro Configuration
- Created metro.config.js with SDK 53 compatible settings
- Proper web platform support
- React Native Web alias configuration

### Clean Installation Process
- Removed all lock files (bun.lock, package-lock.json)
- Fresh npm install with --legacy-peer-deps if needed
- Expo install --fix to ensure compatibility
- Cleaned prebuild artifacts

## If Issues Persist

1. **Manual Metro Fix:**
   ```bash
   npm install metro@0.76.7 --legacy-peer-deps
   ```

2. **Prebuild Clean:**
   ```bash
   npx expo prebuild --platform android --clean
   ```

3. **Complete Reset:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   npx expo install --fix
   ```

## Important Notes
- ⚠️ Never use Bun with Expo - it causes version conflicts
- ⚠️ Always use `npx expo` commands, not `bun expo`
- ⚠️ SDK 53 requires Metro 0.76.x, not 0.79.x or higher
- ✅ The app should work both in web preview and as APK after this fix