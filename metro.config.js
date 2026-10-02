const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Exclude native iOS prebuilt frameworks, dSYMs and SPM dependencies from Metro crawling
config.resolver.blockList = [
  ...(Array.isArray(config.resolver.blockList) ? config.resolver.blockList : [config.resolver.blockList].filter(Boolean)),
  /.*[/\\]node_modules[/\\]expo-image[/\\]prebuilds[/\\].*/,
  /.*\.dSYM[/\\].*/,
  /.*\.xcframework[/\\].*/,
];

module.exports = config;
