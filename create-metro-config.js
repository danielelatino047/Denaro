const fs = require('fs');
const path = require('path');

console.log('🔧 Creating Metro config for SDK 53...');

const metroConfig = `const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// SDK 53 Metro configuration
config.resolver = {
  ...config.resolver,
  platforms: ['ios', 'android', 'native', 'web'],
};

// Ensure compatibility with SDK 53
config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve('metro-react-native-babel-transformer'),
};

module.exports = config;
`;

// Write metro.config.js
const metroConfigPath = path.join(process.cwd(), 'metro.config.js');
fs.writeFileSync(metroConfigPath, metroConfig);

console.log('✅ Metro config created for SDK 53');

// Also create a .npmrc to ensure npm is used
const npmrcContent = `legacy-peer-deps=true
package-lock=true
`;

const npmrcPath = path.join(process.cwd(), '.npmrc');
fs.writeFileSync(npmrcPath, npmrcContent);

console.log('✅ .npmrc created to force npm usage');
console.log('🚀 Metro config ready for SDK 53!');