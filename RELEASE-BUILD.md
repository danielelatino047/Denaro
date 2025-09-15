# ArbitrageSwap AI - Release Build Guide

## 🚀 Quick Release Build

To create a production-ready APK, run:

```bash
node complete-build.js
```

This script will:
1. ✅ Fix all dependency issues (ajv, schema-utils)
2. 🧹 Clean previous builds
3. 📦 Install dependencies with proper resolutions
4. 🔨 Run expo prebuild for Android
5. 📱 Build release APK
6. 📋 Copy APK to root directory

## 📱 Manual Build Process

If you prefer to build manually:

### 1. Fix Dependencies
```bash
node fix-dependencies.js
```

### 2. Run Prebuild
```bash
npx expo prebuild --clean --platform android
```

### 3. Build Release APK
```bash
cd android
./gradlew clean
./gradlew assembleRelease
```

## 🔧 Troubleshooting

### Common Issues

**1. "Cannot find module 'ajv/dist/compile/codegen'"**
- Run: `node fix-dependencies.js`
- This fixes the ajv version conflicts

**2. "Android directory not created"**
- Ensure all dependencies are installed
- Try: `npm install --legacy-peer-deps --force`
- Then: `npx expo prebuild --clean --platform android`

**3. "Gradle build failed"**
- Check Android SDK installation
- Verify ANDROID_HOME environment variable
- Ensure Java 11+ is installed

### Environment Setup

Make sure you have:
- ✅ Node.js 18+
- ✅ Android Studio with SDK
- ✅ Java 11+
- ✅ ANDROID_HOME environment variable set

### Verify Setup
```bash
npx expo doctor
```

## 📋 Release Checklist

Before building:
- [ ] Test app functionality in development
- [ ] Update version in package.json
- [ ] Test on physical device
- [ ] Check app permissions
- [ ] Verify all features work offline

After building:
- [ ] Test APK on multiple devices
- [ ] Check app size and performance
- [ ] Verify all stores/data persist correctly
- [ ] Test app startup and error handling

## 🎯 Production Optimizations Applied

The release build includes:
- ✅ Error boundaries for crash prevention
- ✅ Robust store initialization with fallbacks
- ✅ Proper AsyncStorage error handling
- ✅ Loading states and user feedback
- ✅ Safe area handling for all devices
- ✅ Hermes JavaScript engine for performance
- ✅ Optimized bundle size

## 📱 APK Output

The final APK will be created as:
```
arbitrageswap-ai-release.apk
```

This APK is ready for:
- Direct installation on Android devices
- Upload to Google Play Console
- Distribution via other channels

## 🔒 Security Notes

The release build:
- Uses production-safe error handling
- Includes proper network security config
- Has optimized bundle with dead code elimination
- Uses Hermes for better performance and security