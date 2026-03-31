// const { getSentryExpoConfig } = require("@sentry/react-native/metro");

// const config = getSentryExpoConfig(__dirname);

// module.exports = config;

const { getDefaultConfig } = require("expo/metro-config");

module.exports = (() => {
  const config = getDefaultConfig(__dirname);

  const { transformer, resolver } = config;

  config.transformer = {
    ...transformer,
    babelTransformerPath: require.resolve("react-native-svg-transformer"),
  };
  config.resolver = {
    ...resolver,
    sourceExts: [...resolver.sourceExts, "svg"],
  };

  return config;
})();
