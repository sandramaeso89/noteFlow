// Babel para Expo SDK 50+: babel-preset-expo ya incluye soporte Expo Router.
// No uses el plugin "expo-router/babel" (deprecado y puede romper Metro).
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-reanimated/plugin'],
  };
};
