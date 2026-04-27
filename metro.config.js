const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

config.resolver.unstable_conditionNames = [
  ...(config.resolver.unstable_conditionNames || []),
  "react-native",
];

module.exports = config;